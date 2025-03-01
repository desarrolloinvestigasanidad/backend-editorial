const User = require("../models/User");

exports.addCoauthor = async (req, res) => {
    try {
        const { identifier } = req.body; // DNI/NIE/Pasaporte
        const coauthor = await User.findOne({ where: { id: identifier } });
        if (!coauthor) return res.status(404).json({ message: "Coautor no encontrado." });
        // Aquí se implementaría la lógica para asociar el coautor a un libro o capítulo.
        res.status(200).json({ message: "Coautor agregado.", coauthor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
