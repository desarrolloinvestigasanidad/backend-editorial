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
        type: DataTypes.STRING,
        allowNull: true,
    },
    openDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    deadlineChapters: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    publishDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    normativa: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    freezeTableName: true, // Evita la pluralización automática
    tableName: "editions"  // Especifica el nombre exacto de la tabla en minúsculas
});

module.exports = Edition;
