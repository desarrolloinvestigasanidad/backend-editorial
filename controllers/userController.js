// controllers/userController.js
const { Op, Sequelize } = require('sequelize');
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");

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
        // Se incluye el modelo Role usando el alias "role"
        const users = await User.findAll({
            include: [{ model: Role, as: "role" }]
        });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Nuevo método para crear usuario
exports.createUser = async (req, res) => {
    try {
        // Extraemos datos del body; para staff, se recomienda que roleId sea "1"
        const {
            id,
            email,
            password,
            firstName,
            lastName,
            phone = "N/A",
            address = "N/A",
            country = "N/A",
            province = "N/A",
            autonomousCommunity = "N/A",
            professionalCategory = "Ninguna",
            interests = "N/A",
            verified = false,
            roleId = 1 // Por defecto, para staff (admin)
        } = req.body;

        if (!id || !email || !password) {
            return res.status(400).json({ message: "Los campos DNI, correo y contraseña son obligatorios." });
        }

        // Verificar si ya existe un usuario con el mismo id o email (opcional)
        const existingUser = await User.findOne({ where: { id } });
        if (existingUser) {
            return res.status(400).json({ message: "Ya existe un usuario con ese identificador." });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            id,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            address,
            country,
            province,
            autonomousCommunity,
            professionalCategory,
            interests,
            verified,
            roleId
        });

        res.status(201).json({ message: "Usuario creado correctamente.", user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// controllers/userController.js
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: Role, as: "role" }],
        });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { term } = req.query;

        if (!term) {
            return res.status(200).json([]);
        }

        // Buscar usuarios por id (DNI), email o nombre
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { id: { [Op.like]: `%${term}%` } },
                    { email: { [Op.like]: `%${term}%` } },
                    {
                        [Op.or]: [
                            Sequelize.where(
                                Sequelize.fn('CONCAT', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')),
                                { [Op.like]: `%${term}%` }
                            ),
                            { firstName: { [Op.like]: `%${term}%` } },
                            { lastName: { [Op.like]: `%${term}%` } }
                        ]
                    }
                ]
            },
            attributes: ['id', 'email', 'firstName', 'lastName'],
            limit: 10
        });

        // Formatear la respuesta para que coincida con lo que espera nuestro frontend
        const formattedUsers = users.map(user => ({
            id: user.id,
            dni: user.id, // Ya que tu ID es el DNI
            fullName: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email
        }));

        res.status(200).json(formattedUsers);
    } catch (err) {
        console.error("Error searching users:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        // Extraemos todos los campos que puedas querer actualizar
        const {
            email,
            firstName,
            lastName,
            phone,
            address,
            country,
            province,
            autonomousCommunity,
            professionalCategory,
            interests,
            verified,
            roleId,
            password,
        } = req.body;

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // Para cada campo, si viene en el body, lo reasignamos
        if (email !== undefined) user.email = email;
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (country !== undefined) user.country = country;
        if (province !== undefined) user.province = province;
        if (autonomousCommunity !== undefined) user.autonomousCommunity = autonomousCommunity;
        if (professionalCategory !== undefined) user.professionalCategory = professionalCategory;
        if (interests !== undefined) user.interests = interests;
        if (verified !== undefined) user.verified = verified;
        if (roleId !== undefined) user.roleId = roleId;

        // Si viene contraseña, la hasheamos
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.status(200).json({ message: "Usuario actualizado correctamente." });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: err.message });
    }
};
