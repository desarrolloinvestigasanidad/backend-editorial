'use strict';

/** @type {import('sequelize-cli').Migration} */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Chapters", "studyType", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn("Chapters", "introduction", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.addColumn("Chapters", "objectives", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.addColumn("Chapters", "results", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.addColumn("Chapters", "discussion", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.addColumn("Chapters", "bibliography", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Chapters", "studyType");
    await queryInterface.removeColumn("Chapters", "introduction");
    await queryInterface.removeColumn("Chapters", "objectives");
    await queryInterface.removeColumn("Chapters", "results");
    await queryInterface.removeColumn("Chapters", "discussion");
    await queryInterface.removeColumn("Chapters", "bibliography");
  },
};

