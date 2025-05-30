// En tu archivo de migración YYYYMMDDHHMMSS-add-bookId-chapterId-to-certificates.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Añadir la columna bookId
    await queryInterface.addColumn('certificates', 'bookId', { // Asegúrate que 'certificates' sea el nombre correcto de tu tabla
      type: Sequelize.UUID,
      allowNull: false, // Un certificado siempre debe estar asociado a un libro
      references: {
        model: 'books',   // Nombre de la tabla 'books' (sensible a mayúsculas/minúsculas según tu BD)
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // O 'SET NULL' o 'RESTRICT' según tu lógica de negocio
      // CASCADE: Si se borra el libro, se borran sus certificados.
    });

    // Añadir la columna chapterId
    await queryInterface.addColumn('certificates', 'chapterId', { // Asegúrate que 'certificates' sea el nombre correcto de tu tabla
      type: Sequelize.UUID,
      allowNull: true,  // Un certificado puede no estar asociado a un capítulo específico (ej. certificado de libro completo)
      references: {
        model: 'chapters', // Nombre de la tabla 'chapters' (sensible a mayúsculas/minúsculas)
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // O 'CASCADE' o 'RESTRICT'.
      // SET NULL: Si se borra el capítulo, chapterId en el certificado se vuelve NULL.
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar la columna chapterId primero (si tiene FK, a veces el orden importa)
    await queryInterface.removeColumn('certificates', 'chapterId');
    // Eliminar la columna bookId
    await queryInterface.removeColumn('certificates', 'bookId');
  }
};