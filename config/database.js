require("dotenv").config();
const { Sequelize } = require("sequelize");

// Determina el entorno: 'development', 'test' o 'production'
const env = process.env.NODE_ENV || "development";

// Carga la configuración según el entorno
const config = require("./config.json")[env];

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,

    {
        host: config.host,
        dialect: config.dialect,
        port: config.port,
        logging: false, // Puedes habilitarlo si deseas ver las consultas SQL
    }
);

module.exports = sequelize;
