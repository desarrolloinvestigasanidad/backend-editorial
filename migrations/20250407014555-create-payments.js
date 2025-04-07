'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users', // Asegúrate de que este nombre coincide con el de la tabla de usuarios
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      method: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending'
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approvedBy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      invoiced: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      subtotalChapterEdition: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      subtotalChapterOwnBook: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      subtotalOwnBook: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      subtotalGeneral: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      paidAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      paymentProofUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      adminProofUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payments');
  }
};
