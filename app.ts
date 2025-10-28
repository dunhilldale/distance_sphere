// import express from "express";
// import { Sequelize } from "sequelize";
// import { initProviderModel } from "./src/models/provider";
// import { createProvidersRouter } from "./routes/providers";

// const sequelize = new Sequelize(process.env.DATABASE_URL!, { dialect: "mysql", logging: false });
// initProviderModel(sequelize);

// const app = express();
// app.use(express.json());

// const jwtSecret = process.env.JWT_SECRET ?? "dev-secret";
// app.use("/providers", createProvidersRouter(sequelize, jwtSecret));

// export default app;
