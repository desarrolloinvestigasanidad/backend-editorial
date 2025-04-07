const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Asegurate de tener configurada la conexión

class ChapterPurchase extends Model { }

ChapterPurchase.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        editionId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        chapterCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        amountCharged: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "ChapterPurchase",
        tableName: "chapter_purchases",
        timestamps: true,
    }
);

module.exports = ChapterPurchase;
