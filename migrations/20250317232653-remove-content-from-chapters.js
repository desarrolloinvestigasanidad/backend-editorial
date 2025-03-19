"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Chapters", "content"); // Elimina la columna
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Chapters", "content", { // Rollback (opcional)
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};