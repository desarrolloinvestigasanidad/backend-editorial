const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // 1) Extraer token
    const header = req.header("Authorization") || "";
    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Acceso no autorizado." });

    try {
        // 2) Verificar firma
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Normalizar información de usuario
        req.user = {
            id: payload.sub || payload.id,     // cliente o admin
            roleId: payload.roleId,                // 1 = admin, 2 = cliente…
            actorId: payload.act?.sub || null,      // admin real si es impersonación
            impersonating: !!payload.impersonating        // boolean
        };

        // 4) (debug) log opcional
        if (req.user.impersonating) {
            console.log(
                `[IMPERSONATE] admin=${req.user.actorId} as user=${req.user.id} ` +
                `${req.method} ${req.originalUrl}`
            );
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};
