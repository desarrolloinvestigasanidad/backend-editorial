// models/Chapter.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Book = require("./Book");

const Chapter = sequelize.define("Chapter", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  bookId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: "Books", key: "id" },
  },
  authorId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
}, {
  timestamps: true,
});

// Relaciones con User y Book
User.hasMany(Chapter, { foreignKey: "authorId" });
Chapter.belongsTo(User, { foreignKey: "authorId" });

Book.hasMany(Chapter, { foreignKey: "bookId" });
Chapter.belongsTo(Book, { foreignKey: "bookId" });

module.exports = Chapter;
