const bcrypt = require("bcryptjs");
const crypto = require("crypto");
bcrypt.setRandomFallback((size) => crypto.randomBytes(size));
const jwt = require("jsonwebtoken");
const sendgrid = require("@sendgrid/mail");
const User = require("../models/User");

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.register = async (req, res) => {
    try {
        // Extraemos los campos nuevos y anteriores del body, incluyendo deviceIp y usando infoAccepted para el envío de comunicaciones
        const {
            id,
            email,
            password,
            firstName,
            lastName,
            phone,
            professionalCategory,
            gender,
            address,
            interests,
            country,
            autonomousCommunity,  // se espera que venga como array (por el multi-select)
            province,
            termsAccepted,  // se espera que venga como boolean (true/false)
            infoAccepted,   // se espera que venga como boolean (true/false), indica el consentimiento para comunicaciones
            deviceIp        // IP del dispositivo del usuario
        } = req.body;

        if (!id || !email || !password) {
            return res.status(400).json({ message: "El identificador, correo y contraseña son obligatorios." });
        }

        // Verificar si ya existe el usuario
        const existingUser = await User.findOne({ where: { id } });
        if (existingUser) {
            return res.status(400).json({ message: "Este usuario ya está registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(String(password), salt);

        // Convertimos el array de comunidades a una cadena separada por comas
        const autonomousCommunityString = Array.isArray(autonomousCommunity)
            ? autonomousCommunity.join(", ")
            : autonomousCommunity;

        // Crear el usuario incluyendo los nuevos campos.
        // Se fuerza que termsAccepted e infoAccepted sean true si se han aceptado,
        // y se almacena la IP solo si el usuario aceptó recibir comunicaciones (infoAccepted === true)
        const newUser = await User.create({
            id,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            professionalCategory,
            gender,
            address,
            interests,
            country,
            autonomousCommunity: autonomousCommunityString, // Guardamos como cadena
            province,
            termsAccepted: termsAccepted ? true : false,
            infoAccepted: infoAccepted ? true : false,
            deviceIp: infoAccepted ? deviceIp : null,
            state: "active",
            verified: false,
            roleId: 2
        });

        // Enviar correo de verificación
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const frontendVerificationURL = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        await sendgrid.send({
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: "Verifica tu cuenta en Investiga Sanidad",
            html: `<p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
                   <p><a href="${frontendVerificationURL}">${frontendVerificationURL}</a></p>
                   <p>Si no solicitaste esta verificación, ignora este correo.</p>`
        });

        res.status(201).json({ message: "Usuario registrado. Verifique su email.", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ message: "Token no proporcionado." });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { id: decoded.id } });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado." });
        user.verified = true;
        await user.save();
        const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.status(200).json({ message: "Cuenta verificada correctamente.", token: newToken });
    } catch (err) {
        res.status(500).json({ error: "Token inválido o expirado." });
    }
};

exports.login = async (req, res) => {
    try {
        const { id, password } = req.body;
        const user = await User.findOne({ where: { id } });
        if (!user) return res.status(401).json({ message: "Usuario no encontrado" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });
        if (!user.verified) return res.status(401).json({ message: "Cuenta no verificada. Revise su email." });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.json({ message: "Inicio de sesión exitoso", token, roleId: user.roleId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado." });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        // Se actualizan los campos que ahora incluyen nuevos atributos
        const {
            firstName,
            lastName,
            phone,
            professionalCategory,
            country,
            autonomousCommunity,
            province,
            gender,
            address,
            interests
        } = req.body;
        if (!firstName || !lastName || !country) {
            return res.status(400).json({ message: "Nombre, apellidos y país son obligatorios." });
        }
        const user = await User.findOne({ where: { id } });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado." });
        await user.update({
            firstName,
            lastName,
            phone,
            professionalCategory,
            country,
            autonomousCommunity,
            province,
            gender,
            address,
            interests
        });
        res.status(200).json({ message: "Perfil actualizado con éxito", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.handlePasswordReset = async (req, res) => {
    try {
        const { id, token, newPassword } = req.body;
        if (id) {
            const user = await User.findOne({ where: { id } });
            if (!user) return res.status(404).json({ message: "Usuario no encontrado." });
            const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            await sendgrid.send({
                to: user.email,
                from: process.env.SENDGRID_FROM_EMAIL,
                subject: "Recuperación de Contraseña",
                html: `<p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
                       <p><a href="${resetLink}">${resetLink}</a></p>
                       <p>Si no solicitaste este restablecimiento, ignora este correo.</p>`,
            });
            return res.status(200).json({ message: "Correo de recuperación enviado." });
        } else if (token && newPassword) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ where: { id: decoded.id } });
            if (!user) return res.status(404).json({ message: "Usuario no encontrado." });
            user.password = await bcrypt.hash(String(newPassword), 10);
            await user.save();
            return res.status(200).json({ message: "Contraseña actualizada correctamente." });
        }
        return res.status(400).json({ message: "Datos insuficientes." });
    } catch (err) {
        res.status(500).json({ error: "Token inválido o expirado." });
    }
};
