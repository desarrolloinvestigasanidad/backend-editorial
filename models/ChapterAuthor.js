// models/ChapterAuthor.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Chapter = require("./Chapter");
const User = require("./User");

const ChapterAuthor = sequelize.define("ChapterAuthor", {
    chapterId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: { model: "Chapters", key: "id" }
    },
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        references: { model: "Users", key: "id" }
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: "chapter_authors",
    timestamps: false
});

// Relaciones N:M
Chapter.belongsToMany(User, {
    through: ChapterAuthor,
    foreignKey: "chapterId",
    as: "authors"
});
User.belongsToMany(Chapter, {
    through: ChapterAuthor,
    foreignKey: "userId",
    as: "chapters"
});

module.exports = ChapterAuthor;
