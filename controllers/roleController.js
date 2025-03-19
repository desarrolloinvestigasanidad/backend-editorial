const Role = require("../models/Role");

// Crea un nuevo rol en la base de datos
exports.createRole = async (req, res) => {
    try {
        const { name, description } = req.body;
        // Validación: se requiere el nombre del rol
        if (!name) return res.status(400).json({ message: "El nombre del rol es obligatorio." });

        // Se crea el rol con el nombre y descripción
        const newRole = await Role.create({ name, description });
        res.status(201).json({ message: "Rol creado.", role: newRole });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtiene todos los roles registrados
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.status(200).json(roles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
