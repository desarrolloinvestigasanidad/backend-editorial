// migrations/20250519-add-offerType-chapters-credit-to-discounts.js
'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1) Cambiar el ENUM existente a uno que incluya nuestros nuevos valores
        await queryInterface.changeColumn('discounts', 'discountType', {
            type: Sequelize.ENUM('percentage', 'fixed', 'chapters', 'credit'),
            allowNull: false,
            defaultValue: 'percentage',
        });
        // 2) Añadir columnas
        await queryInterface.addColumn('discounts', 'chapterCount', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
        await queryInterface.addColumn('discounts', 'creditCost', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
        });
        await queryInterface.addColumn('discounts', 'fullBook', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        });
        // 3) (Opcional) renombrar la columna discountType a offerType
        await queryInterface.renameColumn('discounts', 'discountType', 'offerType');
    },

    down: async (queryInterface, Sequelize) => {
        // revertir columnas
        await queryInterface.renameColumn('discounts', 'offerType', 'discountType');
        await queryInterface.removeColumn('discounts', 'chapterCount');
        await queryInterface.removeColumn('discounts', 'creditCost');
        await queryInterface.removeColumn('discounts', 'fullBook');
        // (Revertir el ENUM al original requiere recrear el tipo)
    }
};
