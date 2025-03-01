const Discount = require("../models/Discount");

exports.createDiscount = async (req, res) => {
    try {
        const { code, percentage, appliesToAllEditions, editionId } = req.body;
        if (!code || !percentage) {
            return res.status(400).json({ message: "Código y porcentaje son obligatorios." });
        }
        const discount = await Discount.create({ code, percentage, appliesToAllEditions, editionId });
        res.status(201).json({ message: "Descuento creado.", discount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.findAll();
        res.status(200).json(discounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
