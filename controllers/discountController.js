// controllers/discountController.js
const Discount = require("../models/Discount");

// Crear nuevo descuento
exports.createDiscount = async (req, res) => {
    try {
        const {
            code,
            offerType,
            value,
            chapterCount,
            creditCost,
            fullBook,
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

        if (!code || value == null) {
            return res.status(400).json({ message: "Código y valor son obligatorios." });
        }

        const discount = await Discount.create({
            code,
            offerType,
            value,
            chapterCount: offerType === "chapters" ? chapterCount : null,
            creditCost: offerType === "credit" ? creditCost : null,
            fullBook: offerType === "chapters" ? !!fullBook : false,
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

// Obtener todos los descuentos
exports.getDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.findAll();
        res.status(200).json(discounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar descuento existente
exports.updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await Discount.findByPk(id);
        if (!discount) {
            return res.status(404).json({ message: "Descuento no encontrado." });
        }

        const {
            code,
            offerType,
            value,
            chapterCount,
            creditCost,
            fullBook,
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

        // Update fields
        discount.code = code ?? discount.code;
        discount.offerType = offerType ?? discount.offerType;
        discount.value = value ?? discount.value;
        discount.chapterCount = discount.offerType === "chapters"
            ? (chapterCount ?? discount.chapterCount)
            : null;
        discount.creditCost = discount.offerType === "credit"
            ? (creditCost ?? discount.creditCost)
            : null;
        discount.fullBook = discount.offerType === "chapters"
            ? (fullBook ?? discount.fullBook)
            : false;
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
