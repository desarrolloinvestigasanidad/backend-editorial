const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Certificate = sequelize.define("Certificate", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: { type: DataTypes.STRING, allowNull: false },
        bookId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "books",
                key: "id",
            },
        },
        chapterId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "chapters",
                key: "id",
            },
        },
        type: { type: DataTypes.STRING, allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false },
        documentUrl: { type: DataTypes.STRING, allowNull: true },
        status: { type: DataTypes.STRING, defaultValue: "generated" },
    }, {
        timestamps: true,
        tableName: "certificates",
    });

    Certificate.associate = (models) => {
        Certificate.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user",
        });
        Certificate.belongsTo(models.Book, {
            foreignKey: "bookId",
            as: "book",
        });
        Certificate.belongsTo(models.Chapter, {
            foreignKey: "chapterId",
            as: "chapter",
        });
    };

    return Certificate;
};
