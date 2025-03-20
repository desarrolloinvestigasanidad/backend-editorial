// models/Book.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Edition = require("./Edition");

const Book = sequelize.define("Book", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bookType: {
    // "libro propio" o "libro edición"
    type: DataTypes.ENUM("libro propio", "libro edición"),
    allowNull: false,
    defaultValue: "libro edición",
  },
  cover: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  openDate: {
    // fecha de apertura (si aplica)
    type: DataTypes.DATE,
    allowNull: true,
  },
  deadlineChapters: {
    // fecha máxima para envío de capítulos
    type: DataTypes.DATE,
    allowNull: true,
  },
  publishDate: {
    // fecha de publicación
    type: DataTypes.DATE,
    allowNull: true,
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  interests: {
    // similar al usuario; podría ser un array o JSON
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    // desarrollo, publicado, pre publicado, etc.
    type: DataTypes.STRING,
    defaultValue: "desarrollo",
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  price: {
    // si gestionas un precio para este libro
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  // Autor principal
  authorId: {
    type: DataTypes.STRING,
    allowNull: true,
    references: { model: "Users", key: "id" },
  },
  // Relación con edición (puede ser null si es libro propio)
  editionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: "Editions", key: "id" },
  },
}, {
  timestamps: true,
  tableName: "books"
});

// Relaciones
User.hasMany(Book, { foreignKey: "authorId" });
Book.belongsTo(User, { foreignKey: "authorId" });

Edition.hasMany(Book, { foreignKey: "editionId" });
Book.belongsTo(Edition, { foreignKey: "editionId" });

module.exports = Book;
