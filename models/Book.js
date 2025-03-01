const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

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
  category: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "draft" },
}, {
  timestamps: true,
});

User.hasMany(Book, { foreignKey: "authorId" });
Book.belongsTo(User, { foreignKey: "authorId" });

module.exports = Book;
