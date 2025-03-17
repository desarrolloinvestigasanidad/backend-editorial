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
  title: { type: DataTypes.STRING, allowNull: false },
  authorId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
  // Campo para enlazar el libro a una edición (puede ser null si es un libro propio)
  editionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: "Editions", key: "id" },
  },
  category: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "draft" },
}, {
  timestamps: true,
});

// Relaciones con User
User.hasMany(Book, { foreignKey: "authorId" });
Book.belongsTo(User, { foreignKey: "authorId" });

// Relaciones con Edition
Edition.hasMany(Book, { foreignKey: "editionId" });
Book.belongsTo(Edition, { foreignKey: "editionId" });

module.exports = Book;
