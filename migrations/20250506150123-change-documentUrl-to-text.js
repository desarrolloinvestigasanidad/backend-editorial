'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cambiamos documentUrl de VARCHAR(255) a TEXT
    await queryInterface.changeColumn('books', 'documentUrl', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Para deshacer, volvemos a STRING(255)
    await queryInterface.changeColumn('books', 'documentUrl', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  }
};
