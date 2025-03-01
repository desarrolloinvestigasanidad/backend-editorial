'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Users", "firstName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "lastName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "country", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "phone", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "category", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "region", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "province", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Users", "firstName", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("Users", "lastName", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("Users", "country", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("Users", "phone", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("Users", "category", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("Users", "region", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("Users", "province", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};

