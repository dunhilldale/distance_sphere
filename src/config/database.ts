import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '',
    database: 'vifit',
    models: [__dirname + '/../models'],
});

export default sequelize;