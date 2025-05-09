'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1) Añadimos la columna rejectionReason
    await queryInterface.addColumn('chapters', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // 2) Alteramos el ENUM de status
    await queryInterface.changeColumn('chapters', 'status', {
      type: Sequelize.ENUM('borrador', 'pendiente', 'aprobado', 'rechazado'),
      allowNull: false,
      defaultValue: 'borrador'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 1) Revertimos ENUM a incluir 'eliminado'
    await queryInterface.changeColumn('chapters', 'status', {
      type: Sequelize.ENUM('borrador', 'pendiente', 'aprobado', 'rechazado', 'eliminado'),
      allowNull: false,
      defaultValue: 'borrador'
    });

    // 2) Eliminamos la columna rejectionReason
    await queryInterface.removeColumn('chapters', 'rejectionReason');
  }
};
