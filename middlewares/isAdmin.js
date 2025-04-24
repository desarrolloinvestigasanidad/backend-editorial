// backend-editorial/middlewares/isAdmin.js
module.exports = (req, res, next) => {
    // Si no hay req.user, devolvemos 401
    if (!req.user) {
        return res.status(401).json({ message: "Acceso no autorizado." });
    }
    // Comparación estricta numérica
    if (req.user.roleId === 1) {
        return next();
    }
    return res.status(403).json({ message: "Solo administradores." });
};
