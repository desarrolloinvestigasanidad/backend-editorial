const User = require("../models/User");

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado." });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        // Incluye el modelo Role si deseas obtener información adicional sobre el rol
        const users = await User.findAll({
            include: [{ association: 'Role' }] // Asegúrate de que la asociación esté definida
        });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};