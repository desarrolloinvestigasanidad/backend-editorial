'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("chapter_authors", {
      chapterId: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: "Chapters", key: "id" },
        onDelete: "CASCADE",
        allowNull: false
      },
      userId: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
        allowNull: false
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("chapter_authors");
  }
};

