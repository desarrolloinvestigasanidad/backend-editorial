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
  code: {
    // Código de capítulo
    type: DataTypes.STRING,
    allowNull: true,
  },
  studyType: {
    // tipo de estudio
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  methodology: {
    // Campo adicional (metodología)
    type: DataTypes.TEXT,
    allowNull: false,
  },
  introduction: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  objectives: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  results: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  discussion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  bibliography: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    // borrador, pendiente, aprobado, rechazado, eliminado
    type: DataTypes.ENUM("borrador", "pendiente", "aprobado", "rechazado", "eliminado"),
    defaultValue: "borrador",
  },
  bookId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: "Books", key: "id" },
  },
  editionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: "Editions", key: "id" },
  },
  // autor principal
  authorId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
}, {
  timestamps: true,
  tableName: "chapters",
  freezeTableName: true,
});

// Relaciones
User.hasMany(Chapter, { foreignKey: "authorId" });
Chapter.belongsTo(User, { foreignKey: "authorId" });

Book.hasMany(Chapter, { foreignKey: "bookId" });
Chapter.belongsTo(Book, { foreignKey: "bookId" });

module.exports = Chapter;
