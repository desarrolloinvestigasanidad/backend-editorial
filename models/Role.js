// models/Role.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Role = sequelize.define("Role", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Opcional: JSON para almacenar permisos
    // permissions: {
    //   type: DataTypes.JSON,
    //   allowNull: true
    // },
}, {
    timestamps: true,
});

module.exports = Role;
