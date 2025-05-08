'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'Certificates', // nombre de la tabla en la base de datos
      'documentUrl',  // nombre de la nueva columna
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'Certificates', // nombre de la tabla
      'documentUrl'   // columna a eliminar
    );
  }
};
