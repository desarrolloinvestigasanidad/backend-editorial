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
    // Tipo de descuento (porcentaje vs monto fijo)
    discountType: {
        type: DataTypes.ENUM("percentage", "fixed"),
        defaultValue: "percentage",
    },
    // Valor: si es "percentage" se interpretará como %, si es "fixed", como valor en €
    value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    // Importe mínimo
    minimumPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    // Máximo de usos
    maxUses: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    // Veces que se ha utilizado
    timesUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    // Fecha de inicio
    startDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    // Fecha de fin
    endDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    // Observaciones
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Campos existentes
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
