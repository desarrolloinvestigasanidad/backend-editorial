'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('book_authors', {
      bookId: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: 'books', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      userId: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('book_authors');
  }
};
