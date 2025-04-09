'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Discounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      discountType: {
        type: Sequelize.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'percentage',
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      minimumPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      maxUses: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      timesUsed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      appliesToAllEditions: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      editionId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      expirationDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      applyToOwnBook: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Antes de eliminar la tabla, es importante eliminar el tipo enumerado
    await queryInterface.dropTable('Discounts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Discounts_discountType";');
  }
};
