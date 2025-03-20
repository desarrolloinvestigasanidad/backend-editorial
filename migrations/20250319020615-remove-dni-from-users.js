"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "dni");
  },

  async down(queryInterface, Sequelize) {
    // En el down volvemos a agregar la columna, con el tipo que tuvimos originalmente.
    await queryInterface.addColumn("users", "dni", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
