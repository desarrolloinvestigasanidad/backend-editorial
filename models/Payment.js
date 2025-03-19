// models/Payment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Payment = sequelize.define("Payment", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: "Users", key: "id" },
    },
    amount: {
        // Monto total
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    method: {
        // Método de pago (ej: PayPal, Stripe, Transferencia, etc.)
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        // pending, completed, rejected...
        type: DataTypes.STRING,
        defaultValue: "pending",
    },
    paymentDate: {
        // Fecha real de pago
        type: DataTypes.DATE,
        allowNull: true,
    },
    approvedBy: {
        // ID de usuario admin que aprobó el pago (si aplica)
        type: DataTypes.STRING,
        allowNull: true,
    },
    invoiced: {
        // Indica si se ha facturado
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // Subtotales (si se requiere desglosar)
    subtotalChapterEdition: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    subtotalChapterOwnBook: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    subtotalOwnBook: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    subtotalGeneral: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    paidAmount: {
        // Cantidad pagada (puede ser igual a 'amount' o parcial)
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    paymentProofUrl: {
        // Link para descargar justificante de pago
        type: DataTypes.STRING,
        allowNull: true,
    },
    adminProofUrl: {
        // Para que la administración suba un justificante, si procede
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

// Relación con User
User.hasMany(Payment, { foreignKey: "userId" });
Payment.belongsTo(User, { foreignKey: "userId" });

module.exports = Payment;
