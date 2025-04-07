"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("chapter_purchases", {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('UUID()'),
            },
            userId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            editionId: {
                type: Sequelize.UUID,
                allowNull: false,
            },
            chapterCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            amountCharged: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("chapter_purchases");
    },
};
