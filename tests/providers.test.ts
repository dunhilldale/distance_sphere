import { describe, it, expect, beforeAll } from "bun:test";
import { Sequelize } from "sequelize-typescript";
import sequelize from '../src/config/database-test';
import { initProviderModel } from "../src/models/provider";
import Provider from "../src/models/provider";
import { findNearbyProviders } from "../src/services/providersService";

// let sequelize: Sequelize;

beforeAll(async () => {
  // sequelize = new Sequelize("sqlite::memory:", { dialect: "sqlite", logging: false });
  // sequelize = new Sequelize({
  //     dialect: 'mysql',
  //     host: 'localhost',
  //     username: 'root',
  //     password: '',
  //     database: 'vifit',
  //     models: [__dirname + '/../src/models'],
  // });

  initProviderModel(sequelize);
  await sequelize.sync({ force: true });

  // create sample providers
  await Provider.bulkCreate([
    { name: "A", latitude: 1.3521, longitude: 103.8198, location: {type:'Point', coordinates:[103.8198, 1.3521]}, rating: 4.3 },
    { name: "B", latitude: 1.3525, longitude: 103.8200, location: {type:'Point', coordinates:[103.8200, 1.3525]}, rating: 4.8 },
    { name: "Far", latitude: 2.0, longitude: 104.0, location: {type:'Point', coordinates:[104.0, 2.0]}, rating: 5.0 },
  ], { individualHooks: true });
});

describe("findNearbyProviders", () => {

  it("filters out far providers", async () => {
    const res = await findNearbyProviders(sequelize, {
      latitude: 1.3521,
      longitude: 103.8198,
      distanceKm: 1, // small radius
      limit: 10,
      includeTestProvider: false,
    });

    // Should not include "Far"
    expect(res.some((r: any) => r.name === "Far")).toBe(false);
    expect(res.length).toBeGreaterThanOrEqual(2);
  });

  it("returns nearest providers and includes test provider when flagged", async () => {
    const res = await findNearbyProviders(sequelize, {
      latitude: 1.3521,
      longitude: 103.8198,
      distanceKm: 10,
      limit: 10,
      includeTestProvider: true,
      sortBy: "distance",
    });

    // test provider should be present as first element
    expect(res.length).toBeGreaterThanOrEqual(3);
    expect((res[0] as any).name).toBe("Test Provider");
  });

});
