const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Template = sequelize.define("Template", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
}, {
    timestamps: true,
    tableName: "templates",
});

module.exports = Template;
