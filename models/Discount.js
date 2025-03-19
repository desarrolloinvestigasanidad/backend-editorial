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
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    appliesToAllEditions: {
        // Si es true, aplica a cualquier edición
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    editionId: {
        // Si aplica a una edición concreta
        type: DataTypes.UUID,
        allowNull: true,
    },
    minimumPrice: {
        // precio mínimo para que el descuento sea válido
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    expirationDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    applyToOwnBook: {
        // True si aplica a la creación de un libro propio
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
});

module.exports = Discount;
