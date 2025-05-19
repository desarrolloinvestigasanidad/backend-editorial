// models/Discount.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Discount = sequelize.define("Discount", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    // --- CAMBIO: ahora es offerType con 4 opciones ---
    offerType: {
        type: DataTypes.ENUM("percentage", "fixed", "chapters", "credit"),
        defaultValue: "percentage",
    },
    // Valor base (para percentage/fixed), reutilizado también como valor monetario
    value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    // --- NUEVOS CAMPOS ---
    // Si offerType === "chapters", cuántos capítulos regala
    chapterCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    // Si offerType === "credit", cuántos créditos regala o cuesta
    creditCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    // Si regala libro completo en lugar de un número concreto de capítulos
    fullBook: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // (el resto de campos queda igual)
    minimumPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    maxUses: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    timesUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    appliesToAllEditions: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    editionId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    expirationDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    applyToOwnBook: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "discounts",
});

module.exports = Discount;
