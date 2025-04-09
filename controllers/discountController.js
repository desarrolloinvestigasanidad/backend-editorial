const Discount = require("../models/Discount");

// controllers/discountController.js
exports.createDiscount = async (req, res) => {
    try {
        // Extrae todos los campos necesarios del body
        const {
            code,
            discountType,
            value,
            minimumPrice,
            maxUses,
            timesUsed,
            startDate,
            endDate,
            notes,
            appliesToAllEditions,
            editionId,
            expirationDate,
            applyToOwnBook,
        } = req.body;

        if (!code || !value) {
            return res.status(400).json({ message: "Código y valor son obligatorios." });
        }

        const discount = await Discount.create({
            code,
            discountType,
            value,
            minimumPrice,
            maxUses,
            timesUsed,
            startDate,
            endDate,
            notes,
            appliesToAllEditions,
            editionId,
            expirationDate,
            applyToOwnBook,
        });

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
exports.updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await Discount.findByPk(id);
        if (!discount) {
            return res.status(404).json({ message: "Descuento no encontrado." });
        }

        const {
            code,
            discountType,
            value,
            minimumPrice,
            maxUses,
            timesUsed,
            startDate,
            endDate,
            notes,
            appliesToAllEditions,
            editionId,
            expirationDate,
            applyToOwnBook,
        } = req.body;

        // Actualiza los campos
        discount.code = code ?? discount.code;
        discount.discountType = discountType ?? discount.discountType;
        discount.value = value ?? discount.value;
        discount.minimumPrice = minimumPrice ?? discount.minimumPrice;
        discount.maxUses = maxUses ?? discount.maxUses;
        discount.timesUsed = timesUsed ?? discount.timesUsed;
        discount.startDate = startDate ?? discount.startDate;
        discount.endDate = endDate ?? discount.endDate;
        discount.notes = notes ?? discount.notes;
        discount.appliesToAllEditions = appliesToAllEditions ?? discount.appliesToAllEditions;
        discount.editionId = editionId ?? discount.editionId;
        discount.expirationDate = expirationDate ?? discount.expirationDate;
        discount.applyToOwnBook = applyToOwnBook ?? discount.applyToOwnBook;

        await discount.save();
        res.status(200).json({ message: "Descuento actualizado.", discount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

