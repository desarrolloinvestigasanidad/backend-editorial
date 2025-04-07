"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Agrega la columna editionId a la tabla chapters
    await queryInterface.addColumn("chapters", "editionId", {
      type: Sequelize.UUID,
      allowNull: false,
      // Si la columna debe hacer referencia a otra tabla, puedes agregar la opción "references"
      // references: { model: "Editions", key: "id" },
    });
  },

  async down(queryInterface, Sequelize) {
    // Elimina la columna editionId en caso de revertir la migración
    await queryInterface.removeColumn("chapters", "editionId");
  },
};
