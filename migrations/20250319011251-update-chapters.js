"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Chapters", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      studyType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      methodology: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      introduction: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      objectives: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      results: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      discussion: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      bibliography: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        // borrador, pendiente, aprobado, rechazado, eliminado
        type: Sequelize.ENUM("borrador", "pendiente", "aprobado", "rechazado", "eliminado"),
        defaultValue: "borrador",
      },
      bookId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Books",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      authorId: {
        // Usuario autor principal
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Users",
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
    // Eliminar primero el ENUM en Postgres
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_Chapters_status";`);
    await queryInterface.dropTable("Chapters");
  },
};
