const CreditConsumptionHistory = require("../models/CreditHistory");

// Obtener el historial de consumo de créditos de un usuario para una edición específica
exports.getCreditConsumptionHistory = async (req, res) => {
    try {
        const { userId, editionId } = req.params;

        const history = await CreditConsumptionHistory.findAll({
            where: { userId, editionId },
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching credit consumption history:", error);
        res.status(500).json({ message: error.message });
    }
};
