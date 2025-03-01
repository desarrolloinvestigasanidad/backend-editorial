const Role = require("../models/Role");

exports.createRole = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: "El nombre del rol es obligatorio." });
        const newRole = await Role.create({ name, description });
        res.status(201).json({ message: "Rol creado.", role: newRole });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.status(200).json(roles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
