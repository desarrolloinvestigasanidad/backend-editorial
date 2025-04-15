// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Role = require("./Role");

const User = sequelize.define("User", {
    // Se asume que 'id' será un identificador interno. 

    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        // nombre
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        // apellidos
        type: DataTypes.STRING,
        allowNull: true,
    },
    gender: {
        type: DataTypes.STRING, // "M", "F", "Otro", etc.
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // 'region' renombrado a 'autonomousCommunity' para mayor claridad
    autonomousCommunity: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    province: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // categoría profesional
    professionalCategory: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    interests: {
        // Podrías usar TEXT para almacenar un JSON stringificado
        type: DataTypes.TEXT,
        allowNull: true,
    },
    verified: {
        // correo validado
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    lastAccessIp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    termsAccepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    infoAccepted: {
        // Aceptación de comunicaciones
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    deviceIp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    state: {
        // Estado del cliente/usuario: activo, bloqueado, etc.
        type: DataTypes.STRING,
        allowNull: true,
    },
    roleId: {
        // Relación con la tabla de roles
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2, // Ej: 1 = Admin, 2 = Cliente
    },
}, {
    timestamps: true,
    tableName: "users",
});

// Relación con Roles
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

module.exports = User;
