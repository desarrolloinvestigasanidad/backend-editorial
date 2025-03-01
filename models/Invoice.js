const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Invoice = sequelize.define("Invoice", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: { type: DataTypes.STRING, allowNull: false },
    paymentId: { type: DataTypes.UUID, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "paid" },
    pdfUrl: { type: DataTypes.STRING, allowNull: true },
}, {
    timestamps: true,
});

module.exports = Invoice;
