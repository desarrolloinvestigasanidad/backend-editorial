// models/creditHistory.js
module.exports = (sequelize, DataTypes) => {
    const CreditHistory = sequelize.define('CreditHistory', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        editionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: true,
    });

    return CreditHistory;
};
