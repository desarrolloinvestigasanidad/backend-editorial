"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        // Se asume que quieres usar un string (por ejemplo, un UUID manual o un custom ID)
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      dni: {
        // DNI/NIE/Pasaporte
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      autonomousCommunity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      province: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      professionalCategory: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      interests: {
        // Podrías almacenar un JSON stringificado
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verified: {
        // correo validado
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      lastAccessIp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      termsAccepted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      infoAccepted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      state: {
        // estado del usuario/cliente
        type: Sequelize.STRING,
        allowNull: true,
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2, // Por ejemplo, 2 = "usuario normal"
        references: {
          model: "Roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
    await queryInterface.dropTable("Users");
  },
};
