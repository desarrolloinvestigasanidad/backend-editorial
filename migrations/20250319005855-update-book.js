"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Books", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subtitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bookType: {
        // "libro propio" o "libro edición"
        type: Sequelize.ENUM("libro propio", "libro edición"),
        allowNull: false,
        defaultValue: "libro edición",
      },
      cover: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      openDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deadlineChapters: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      publishDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isbn: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      interests: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        // "desarrollo", "pre publicado", "publicado", etc.
        type: Sequelize.STRING,
        defaultValue: "desarrollo",
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      authorId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      editionId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Editions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    // Importante: eliminar primero el ENUM antes de dropear la tabla (en Postgres)
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_Books_bookType";`);
    await queryInterface.dropTable("Books");
  },
};
