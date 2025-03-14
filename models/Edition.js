const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Edition = sequelize.define("Edition", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
}, {
    timestamps: true,
});

module.exports = Edition;
