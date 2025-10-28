import { Sequelize } from "sequelize";
import Provider from "../models/provider";

export type NearbyOptions = {
  latitude: number;
  longitude: number;
  distanceKm?: number; // cutoff distance in km
  limit?: number;
  offset?: number;
  sortBy?: "distance" | "rating";
  includeTestProvider?: boolean;
};

// Converts distance km -> meters
const kmToMeters = (km: number) => Math.round(km * 1000);

export async function findNearbyProviders(sequelize: Sequelize, opts: NearbyOptions) {
    const {
        latitude,
        longitude,
        distanceKm = 5,
        limit = 10,
        offset = 0,
        sortBy = "distance",
        includeTestProvider = false,
    } = opts;

    // Use bounding box to limit rows: compute latitude/longitude deltas
    // Approx: 1 deg latitude ~ 111.32 km; 1 deg longitude depends on latitude
    const R = 6371; // earth radius km
    const latDelta = distanceKm / 111.32;
    const lonDelta = distanceKm / (111.32 * Math.cos((latitude * Math.PI) / 180));

    const minLat = latitude - latDelta;
    const maxLat = latitude + latDelta;
    const minLon = longitude - lonDelta;
    const maxLon = longitude + lonDelta;

    const distanceMeters = kmToMeters(distanceKm);

    // Raw SQL: compute distance in meters with ST_Distance_Sphere (meters)
    // Return providers within bounding box and distance cutoff.
    // Note: we alias distance so we can ORDER BY it or by rating.
    const orderClause =
        sortBy === "distance"
            ? "distance_m ASC"
            : "p.rating DESC, distance_m ASC"; // rating desc then distance tie-break

    const sql = `
        SELECT p.*,
            ST_Distance_Sphere(POINT(p.longitude, p.latitude), POINT(:lng, :lat)) as distance_m
        FROM providers p
        WHERE p.latitude BETWEEN :minLat AND :maxLat
            AND p.longitude BETWEEN :minLon AND :maxLon
            AND ST_Distance_Sphere(POINT(p.longitude, p.latitude), POINT(:lng, :lat)) <= :maxMeters
        ORDER BY ${orderClause}
        LIMIT :limit OFFSET :offset
    `;

    const rows = await sequelize.query(sql, {
        model: Provider,
        mapToModel: true,
        replacements: {
            lat: latitude,
            lng: longitude,
            point: `POINT(${longitude} ${latitude})`,
            cutoff: distanceKm * 1000,
            minLat,
            maxLat,
            minLon,
            maxLon,
            maxMeters: distanceMeters,
            limit,
            offset,
        },
    });

    const providers = rows as (Provider & { dataValues?: any })[];

    // If test user, append a synthetic testing provider (if requested)
    if (includeTestProvider) {
        // make test provider close to requested coordinates so it appears at top
        const testProvider = Provider.build({
            id: 0,
            name: "Test Provider",
            latitude: 1.3521,
            longitude: 103.8198,
            location: {type:'Point', coordinates:[103.8198, 1.3521]},
            rating: 5,
        });

        let dataValues: object = (testProvider as any).dataValues;
        dataValues = {...dataValues, distance_m: 0 };
        return [testProvider, ...providers];
    }

    return providers;
}
