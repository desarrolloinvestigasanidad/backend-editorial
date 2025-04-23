module.exports = (req, res, next) => {
    if (req.user?.roleId === 1) return next();   // admin
    return res.status(403).json({ message: "Solo administradores." });
};
