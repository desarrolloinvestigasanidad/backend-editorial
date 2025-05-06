'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cambia la columna cover de STRING(255) a TEXT
    await queryInterface.changeColumn('books', 'cover', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Para deshacer, volvemos a VARCHAR(255)
    await queryInterface.changeColumn('books', 'cover', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  }
};
