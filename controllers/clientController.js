const User = require("../models/User");

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