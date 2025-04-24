// backend-editorial/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // 1) Extraer token
    const header = req.header("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ message: "Acceso no autorizado." });
    }

    try {
        // 2) Verificar firma
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Normalizar información de usuario
        req.user = {
            id: payload.sub || payload.id,                              // cliente o admin
            roleId: Number(payload.roleId),                             // forzar número
            actorId: payload.act?.sub ? String(payload.act.sub) : null, // admin real si impersonación
            impersonating: Boolean(payload.impersonating),              // booleano
        };

        // 4) Log de impersonación (opcional, sólo si impersonating)
        if (req.user.impersonating) {
            console.info(
                `[IMPERSONATE] admin=${req.user.actorId} → as user=${req.user.id} ` +
                `${req.method} ${req.originalUrl}`
            );
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};
