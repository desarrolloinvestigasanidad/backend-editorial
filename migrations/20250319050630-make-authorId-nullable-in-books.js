"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Intentar eliminar la restricción si existe
    try {
      await queryInterface.removeConstraint("Books", "books_ibfk_5");
    } catch (error) {
      console.warn("La restricción books_ibfk_5 no existe, se continúa...");
    }

    // Cambiar la columna para permitir valores nulos
    await queryInterface.changeColumn("Books", "authorId", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Agregar la restricción foránea nuevamente, ahora permitiendo null (ON DELETE SET NULL)
    await queryInterface.addConstraint("Books", {
      fields: ["authorId"],
      type: "foreign key",
      name: "books_ibfk_5",
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar la restricción actual
    try {
      await queryInterface.removeConstraint("Books", "books_ibfk_5");
    } catch (error) {
      console.warn("La restricción books_ibfk_5 no existe, se continúa...");
    }

    // Revertir la columna a NOT NULL
    await queryInterface.changeColumn("Books", "authorId", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Reagregar la restricción foránea original (puedes ajustar ON DELETE según tu configuración previa)
    await queryInterface.addConstraint("Books", {
      fields: ["authorId"],
      type: "foreign key",
      name: "books_ibfk_5",
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};
