// controllers/authController.js

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
bcrypt.setRandomFallback((size) => crypto.randomBytes(size));

const jwt = require("jsonwebtoken");
const sendgrid = require("@sendgrid/mail");
const User = require("../models/User");

// Configurar SendGrid solo si hay API key válida
const SENDGRID_ENABLED = process.env.SENDGRID_API_KEY &&
    process.env.SENDGRID_API_KEY.startsWith('SG.') &&
    process.env.SENDGRID_FROM_EMAIL;

if (SENDGRID_ENABLED) {
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('SendGrid configurado correctamente');
} else {
    console.log('SendGrid no configurado - emails deshabilitados, usuarios se verificarán automáticamente');
}

// --- TEMPLATES DE CORREO -------------------------------------------------

const {
    getValidationEmailTemplate,
    getWelcomeEmailTemplate,
    getPasswordResetEmailTemplate
} = require("../templates/emailTemplates");

// --- CONTROLLERS ----------------------------------------------------------

exports.register = async (req, res) => {
    try {
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
            autonomousCommunity,
            province,
            termsAccepted,
            infoAccepted,
            deviceIp
        } = req.body;

        if (!id || !email || !password) {
            return res.status(400).json({
                message: "El identificador, correo y contraseña son obligatorios."
            });
        }

        const existingUser = await User.findOne({ where: { id } });
        if (existingUser) {
            return res.status(400).json({ message: "Este usuario ya está registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(String(password), salt);

        const autonomousCommunityString = Array.isArray(autonomousCommunity)
            ? autonomousCommunity.join(", ")
            : autonomousCommunity;

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
            autonomousCommunity: autonomousCommunityString,
            province,
            termsAccepted: termsAccepted === true,
            infoAccepted: infoAccepted === true,
            deviceIp,
            state: "active",
            verified: !SENDGRID_ENABLED, // Auto-verificar si no hay SendGrid
            roleId: 2
        });

        // Envío del correo de validación solo si SendGrid está configurado
        const token = jwt.sign(
            { sub: newUser.id, roleId: newUser.roleId },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        if (SENDGRID_ENABLED) {
            const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
            const validationEmail = getValidationEmailTemplate(firstName, verifyUrl);

            await sendgrid.send({
                to: email,
                from: {
                    email: process.env.SENDGRID_FROM_EMAIL,
                    name: "Investiga Sanidad"
                },
                subject: validationEmail.subject,
                html: validationEmail.html
            });

            res
                .status(201)
                .json({ message: "Usuario registrado. Verifique su email.", token });
        } else {
            // Sin SendGrid, el usuario ya está verificado
            res
                .status(201)
                .json({ message: "Usuario registrado correctamente. Ya puede iniciar sesión.", token });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: "Token no proporcionado." });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(400).json({ message: "Token inválido o expirado." });
    }

    const user = await User.findOne({ where: { id: payload.sub } });
    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (user.verified) {
        return res
            .status(200)
            .json({ message: "Cuenta ya verificada. Por favor, inicia sesión." });
    }

    user.verified = true;
    await user.save();

    // Envío del correo de bienvenida solo si SendGrid está configurado
    if (SENDGRID_ENABLED) {
        const loginUrl = `${process.env.FRONTEND_URL}/login`;
        const welcomeEmail = getWelcomeEmailTemplate(user.firstName, loginUrl);

        await sendgrid.send({
            to: user.email,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: "Investiga Sanidad"
            },
            subject: welcomeEmail.subject,
            html: welcomeEmail.html
        });
    }

    res
        .status(200)
        .json({ message: "Cuenta verificada correctamente. Por favor, inicia sesión." });
};

exports.login = async (req, res) => {
    try {
        const { id, password } = req.body;
        const user = await User.findOne({ where: { id } });
        if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Contraseña incorrecta" });

        if (!user.verified)
            return res
                .status(401)
                .json({ message: "Cuenta no verificada. Revise su email." });

        const token = jwt.sign(
            { id: user.id, sub: user.id, roleId: user.roleId },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

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
            return res
                .status(400)
                .json({ message: "Nombre, apellidos y país son obligatorios." });
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

            if (!SENDGRID_ENABLED) {
                return res.status(503).json({ message: "El servicio de correo no está configurado. Contacte al administrador." });
            }

            const resetToken = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            const resetEmail = getPasswordResetEmailTemplate(user.firstName, resetUrl);

            await sendgrid.send({
                to: user.email,
                from: {
                    email: process.env.SENDGRID_FROM_EMAIL,
                    name: "Investiga Sanidad"
                },
                subject: resetEmail.subject,
                html: resetEmail.html
            });

            return res.status(200).json({ message: "Correo de recuperación enviado." });
        } else if (token && newPassword) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ where: { id: decoded.id } });
            if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

            user.password = await bcrypt.hash(String(newPassword), 10);
            await user.save();

            return res
                .status(200)
                .json({ message: "Contraseña actualizada correctamente." });
        }

        return res.status(400).json({ message: "Datos insuficientes." });
    } catch (err) {
        res.status(500).json({ error: "Token inválido o expirado." });
    }
};
