'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1) Añadimos la columna rejectionReason
    await queryInterface.addColumn('books', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // 2) Alteramos el ENUM de status
    await queryInterface.changeColumn('books', 'status', {
      type: Sequelize.ENUM('borrador', 'pendiente', 'aprobado', 'rechazado', 'publicado'),
      allowNull: false,
      defaultValue: 'borrador'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 1) Revertimos ENUM al antiguo (por ejemplo 'desarrollo' o texto libre)
    // Si antes era STRING, hay que volver a STRING:
    await queryInterface.changeColumn('books', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'desarrollo'
    });

    // 2) Eliminamos la columna rejectionReason
    await queryInterface.removeColumn('books', 'rejectionReason');
  }
};
