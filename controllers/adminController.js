const jwt = require("jsonwebtoken");
const User = require("../models/User");

// POST /api/admin/impersonate/:userId
exports.impersonateUser = async (req, res) => {
    const { userId } = req.params;

    // 1) Verifica que exista el cliente
    const target = await User.findByPk(userId);
    if (!target) return res.status(404).json({ message: "Cliente no encontrado" });

    // 2) Crea token "actor aware"
    const token = jwt.sign(
        {
            sub: target.id,          // usuario efectivo
            act: { sub: req.user.id }, // actor = admin real
            roleId: target.roleId,
            impersonating: true
        },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
    );

    // (opcional) registra en logs/BBDD
    console.info(`[IMPERSONATE] admin=${req.user.id} -> client=${target.id}`);

    res.json({ impersonationToken: token });
};
