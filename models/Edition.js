// models/Edition.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Edition = sequelize.define("Edition", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subtitle: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    cover: {
        // Archivo/URL de la portada
        type: DataTypes.STRING,
        allowNull: true,
    },
    openDate: {
        // fecha de apertura
        type: DataTypes.DATE,
        allowNull: true,
    },
    deadlineChapters: {
        // fecha máxima de envío de capítulos
        type: DataTypes.DATE,
        allowNull: true,
    },
    publishDate: {
        // fecha de publicación
        type: DataTypes.DATE,
        allowNull: true,
    },
    normativa: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        // Podrías mantener un campo de descripción adicional
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = Edition;
