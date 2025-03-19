"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Chapters", "title");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Chapters", "title", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};

