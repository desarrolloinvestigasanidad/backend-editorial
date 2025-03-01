const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Discount = sequelize.define("Discount", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    appliesToAllEditions: { type: DataTypes.BOOLEAN, defaultValue: true },
    editionId: { type: DataTypes.UUID, allowNull: true },
}, {
    timestamps: true,
});

module.exports = Discount;
