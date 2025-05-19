const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getAllClients = async (req, res) => {
    try {
        // Filtra los usuarios con roleId 2 (Clientes)
        const clients = await User.findAll({
            where: { roleId: 2 },

        });
        // Envía la respuesta en un objeto similar al que espera el front (con la propiedad "users")
        res.status(200).json({ users: clients });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        // Busca un usuario con ese id y que tenga roleId = 2 (cliente)
        const client = await User.findOne({ where: { id, roleId: 2 } });
        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado." });
        }
        res.status(200).json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateClientById = async (req, res) => {
    try {
        const { id } = req.params;
        // Buscar solo clientes (roleId === 2)
        const client = await User.findOne({ where: { id, roleId: 2 } });
        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado." });
        }
        // Actualiza con los datos enviados en req.body
        await client.update(req.body);
        res.status(200).json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await User.findOne({ where: { id, roleId: 2 } });
        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado." });
        }
        await client.destroy();
        res.status(200).json({ message: "Cliente eliminado." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Asumiendo que tienes un modelo Payment con el campo clientId
exports.getClientPayments = async (req, res) => {
    try {
        const { id } = req.params;
        // Filtra pagos del cliente
        const payments = await Payment.findAll({ where: { clientId: id } });
        res.status(200).json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Asumiendo que tienes un modelo Publication y que vinculas publicaciones al cliente mediante clientId
exports.getClientPublications = async (req, res) => {
    try {
        const { id } = req.params;
        const publications = await Publication.findAll({ where: { clientId: id } });
        res.status(200).json(publications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.impersonateClient = async (req, res) => {
    try {
        // Solo los administradores (roleId === 1) pueden impersonar a otro usuario
        if (req.user.roleId !== 1) {
            return res.status(403).json({ message: "No autorizado." });
        }

        const { id } = req.params;
        // Buscar el cliente que tenga roleId === 2
        const client = await User.findOne({ where: { id, roleId: 2 } });
        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado." });
        }

        // Generar un token de impersonación usando los datos del cliente.
        // Puedes incluir los datos que consideres necesarios (por ejemplo, id, roleId, email, etc.)
        const impersonationToken = jwt.sign(
            {
                id: client.id,
                roleId: client.roleId,
                email: client.email,
            },
            config.secret, // clave secreta para firmar el token
            { expiresIn: "1h" } // El token expira en 1 hora (ajusta según lo necesites)
        );

        return res.redirect(`${config.frontendUrl}/?impersonationToken=${impersonationToken}`);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.changeUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res
                .status(400)
                .json({ message: "La nueva contraseña debe tener al menos 8 caracteres." });
        }

        // Verificar que el usuario existe
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // Encriptar y actualizar
        const hashed = await bcrypt.hash(newPassword, 10);
        await User.update(
            { password: hashed },
            { where: { id } }
        );

        return res
            .status(200)
            .json({ message: "Contraseña actualizada correctamente." });
    } catch (err) {
        console.error("Error al cambiar contraseña:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.verifyClientById = async (req, res) => {
    try {
        // 1) Comprobar rol
        if (req.user.roleId !== 1) {
            return res.status(403).json({ message: "No autorizado." });
        }

        const { id } = req.params;
        // 2) Encontrar al cliente
        const client = await User.findOne({ where: { id, roleId: 2 } });
        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado." });
        }

        // 3) Actualizar verified. Permitimos toggle o establecer explícito
        const { verified } = req.body;
        // Si no viene verified en body, invertimos el valor actual
        const newStatus = typeof verified === "boolean"
            ? verified
            : !client.verified;

        client.verified = newStatus;
        await client.save();

        // 4) Devolver el objeto actualizado
        return res.status(200).json({ message: "Estado de verificación actualizado.", client });
    } catch (err) {
        console.error("Error en verifyClientById:", err);
        return res.status(500).json({ error: err.message });
    }
};