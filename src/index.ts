import express from 'express';
import type { Request, Response } from 'express';
import sequelize from './config/database';
import { initProviderModel } from "./models/provider";
import { createProvidersRouter } from "./routes/providerRoute";
import authRouter from "./routes/authRoute";

const app = express();
const port = process.env.SERVER_PORT;
const jwtSecret = process.env.JWT_SECRET ?? "";

// console.log("port: ", port);
// console.log("jwtSecret: ", jwtSecret);

// const sequelize = new Sequelize(process.env.DATABASE_URL!, { dialect: "mysql", logging: false });
initProviderModel(sequelize);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/providers", createProvidersRouter(sequelize, jwtSecret));
app.use("/auth", authRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from Express with Bun and TypeScript!');
});

sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

export default app;
