const User = require("../models/User");

exports.getUserProfile = async (req, res) => {
    try {
        // Se asume que req.user contiene la información del usuario autenticado
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado." });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        // Se asume que en el modelo User se ha definido:
        // User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
        const users = await User.findAll({
            include: [{ association: 'role' }] // Asegúrate de que el alias coincida con el definido en el modelo
        });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
