"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Payments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      method: {
        // PayPal, Stripe, Transferencia, etc.
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        // pending, completed, rejected, etc.
        type: Sequelize.STRING,
        defaultValue: "pending",
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      approvedBy: {
        // ID de usuario admin que aprobó el pago (si aplica)
        type: Sequelize.STRING,
        allowNull: true,
      },
      invoiced: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      // Subtotales
      subtotalChapterEdition: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      subtotalChapterOwnBook: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      subtotalOwnBook: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      subtotalGeneral: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      paidAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      paymentProofUrl: {
        // Justificante de pago
        type: Sequelize.STRING,
        allowNull: true,
      },
      adminProofUrl: {
        // Justificante subido por admin
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Payments");
  },
};
