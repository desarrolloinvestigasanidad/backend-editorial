// models/Invoice.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Invoice = sequelize.define("Invoice", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    invoiceCode: {
        // Código/folio de la factura
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    paymentId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    units: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "paid",
    },
    pdfUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: "invoices", // Especifica el nombre exacto de la tabla en minúsculas
});

module.exports = Invoice;
