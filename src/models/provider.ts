import { DataType, Model, Sequelize } from "sequelize-typescript";
import type { Optional } from "sequelize";
import { Table } from "sequelize-typescript";

interface ProviderAttributes {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  location: object;
  rating: number; // star rating, 0..5
  // location is virtual/POINT typed column
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProviderCreationAttributes extends Optional<ProviderAttributes, "id"> {}

@Table
class Provider extends Model<ProviderAttributes, ProviderCreationAttributes>

implements ProviderAttributes {
    declare id: number;
    declare name: string;
    declare latitude: number;
    declare longitude: number;
    declare location: any;
    declare rating: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initProviderModel(sequelize: Sequelize) {
  const dialect = sequelize.getDialect();
  const isSpatialReady = dialect === "mysql" || dialect === "mariadb";
  const locationType = isSpatialReady ? DataType.GEOMETRY("POINT") : DataType.JSON;

    Provider.init(
        {
            id: {
                type: DataType.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: { type: DataType.STRING(255), allowNull: false },
            latitude: { type: DataType.DOUBLE, allowNull: false },
            longitude: { type: DataType.DOUBLE, allowNull: false },
            location: { type: locationType, allowNull: false },
            rating: { type: DataType.FLOAT, allowNull: false, defaultValue: 0 },
            // We'll create a stored/generated POINT column in migrations or raw SQL.
        },
        {
            sequelize,
            modelName: "Provider",
            tableName: "providers",
            timestamps: true,
        }
    );

    Provider.beforeSave((p) => {
        if (p.latitude != null && p.longitude != null) {
            if (dialect === "mysql" || dialect === "mariadb") {
                // For MySQL GEOMETRY column, set as GeoJSON style object
                p.location = { type: "Point", coordinates: [p.longitude, p.latitude] } as any;
            } else {
                // For tests (sqlite) store a JSON representation so assertions can still work
                p.location = { lon: p.longitude, lat: p.latitude };
            }
        }
    });
}

export default Provider;

/**
 * 
'POINT(103.8198 1.3521)',4326

-- Add a POINT location column and spatial index (MySQL)
ALTER TABLE providers
  ADD SPATIAL INDEX idx_providers_location (location);

-- Also add index on rating for sorting
CREATE INDEX idx_providers_rating ON providers (rating DESC);

SELECT id, name,
       ST_Distance_Sphere(POINT(longitude, latitude), POINT(103.8198, 1.3521)) AS distance_m
FROM providers
ORDER BY distance_m
LIMIT 5;

 */
