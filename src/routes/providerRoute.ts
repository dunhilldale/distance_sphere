import { Router } from "express";
import type { Request, Response } from "express";
import { Sequelize } from "sequelize";
import { findNearbyProviders } from "../services/providersService";
import { validateUser } from "../middleware/auth";

export function createProvidersRouter(sequelize: Sequelize, jwtSecret: string) {
  const router = Router();
  router.use(validateUser(jwtSecret));

  // GET /providers/nearby
  router.get("/nearby", async (req: Request, res: Response) => {
    try {
      const q = req.query;
      const lat = parseFloat(String(q.latitude));
      const lng = parseFloat(String(q.longitude));
      const limit = Math.max(1, Math.min(100, parseInt(String(q.limit ?? "10"))));
      const offset = Math.max(0, parseInt(String(q.offset ?? "0")));
      const distance = Math.max(0.1, parseFloat(String(q.distance ?? "5"))); // km
      const sortBy = String(q.sortby ?? "distance") === "rating" ? "rating" : "distance";

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return res.status(400).json({ error: "latitude/longitude required" });
      }

      const providers = await findNearbyProviders(sequelize, {
        latitude: lat,
        longitude: lng,
        distanceKm: distance,
        limit,
        offset,
        sortBy: sortBy as "distance" | "rating",
        includeTestProvider: !!req.user?.isTest,
      });

      // Map to JSON-friendly response including distance in meters
      const response = providers.map((p: any) => {
        const dv = p.dataValues ?? p.toJSON();
        return {
          id: p.id,
          name: p.name,
          latitude: p.latitude,
          longitude: p.longitude,
          rating: p.rating,
          distance_m: dv.distance_m ?? null,
        };
      });

      return res.json({ items: response });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "server error" });
    }
  });

  return router;
}
