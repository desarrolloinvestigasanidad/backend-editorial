const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Certificate = sequelize.define("Certificate", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    documentUrl: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: "generated" },
}, {
    timestamps: true,
});

module.exports = Certificate;
