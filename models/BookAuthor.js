// models/BookAuthor.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Book = require("./Book");
const User = require("./User");

const BookAuthor = sequelize.define("BookAuthor", {
    bookId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: { model: "Books", key: "id" }
    },
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        references: { model: "Users", key: "id" }
    }
}, {
    tableName: "book_authors",
    timestamps: false
});

// Relaciones N:M
Book.belongsToMany(User, { through: BookAuthor, foreignKey: "bookId", as: "coAuthors" });
User.belongsToMany(Book, { through: BookAuthor, foreignKey: "userId", as: "booksCoordinated" });

module.exports = BookAuthor;
