const bcrypt = require("bcryptjs");
const crypto = require("crypto");
bcrypt.setRandomFallback((size) => crypto.randomBytes(size));
const jwt = require("jsonwebtoken");
const sendgrid = require("@sendgrid/mail");
const User = require("../models/User");

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// --- TEMPLATES DE CORREO -------------------------------------------------

function getValidationEmailTemplate(userName, url) {
    return {
        subject: "Validación de Cuenta - Investiga Sanidad",
        html: `
        <p>Estimado/a ${userName},</p>
        <p>Gracias por registrarte en Investiga Sanidad. Para completar el proceso de registro y activar tu cuenta, por favor, haz clic en el siguiente enlace:</p>
        <p><a href="${url}">${url}</a></p>
        <p>Si no has solicitado este registro, puedes ignorar este correo.</p>
        <p>¡Bienvenido/a a nuestra comunidad de investigación científica!</p>
      `
    };
}

function getWelcomeEmailTemplate(userName, loginUrl) {
    return {
        subject: "Te has registrado correctamente en Investiga Sanidad",
        html: `
        <p>Estimado/a ${userName},</p>
        <p>¡Tu cuenta ha sido registrada correctamente en Investiga Sanidad! Ahora puedes acceder a nuestra plataforma para publicar tus trabajos científicos.</p>
        <p>Para acceder a tu cuenta, por favor, inicia sesión con tus credenciales en el siguiente enlace:</p>
        <p><a href="${loginUrl}">${loginUrl}</a></p>
        <p>Si tienes alguna duda o necesitas asistencia, no dudes en contactarnos.</p>
        <p>¡Gracias por formar parte de Investiga Sanidad!</p>
      `
    };
}

function getPasswordResetEmailTemplate(userName, resetUrl) {
    return {
        subject: "Has recuperado tu contraseña en Investiga Sanidad",
        html: `
        <p>Estimado/a ${userName},</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña en Investiga Sanidad. Para proceder, haz clic en el siguiente enlace y crea una nueva contraseña:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Si no has solicitado este cambio, por favor ignora este correo. Si necesitas asistencia adicional, puedes ponerte en contacto con nosotros.</p>
      `
    };
}

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
            deviceIp,
            state: "active",
            verified: false,
            roleId: 2
        });

        // Envío solo del correo de validación
        const token = jwt.sign({ sub: newUser.id, roleId: newUser.roleId }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        const validationEmail = getValidationEmailTemplate(firstName, verifyUrl);
        await sendgrid.send({ to: email, from: { email: process.env.SENDGRID_FROM_EMAIL, name: 'Investiga Sanidad' }, subject: validationEmail.subject, html: validationEmail.html });



        res.status(201).json({ message: "Usuario registrado. Verifique su email.", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: "Token no proporcionado." });
    }

    // Intentamos verificar el JWT
    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(400).json({ message: "Token inválido o expirado." });
    }

    // Obtenemos el usuario a partir de payload.sub
    const user = await User.findOne({ where: { id: payload.sub } });
    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Si ya estaba verificado, devolvemos un mensaje informativo
    if (user.verified) {
        return res.status(200).json({ message: "Cuenta ya verificada. Por favor, inicia sesión." });
    }

    // Marcamos como verificado
    user.verified = true;
    await user.save();

    // Envío del correo de bienvenida
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const welcomeEmail = getWelcomeEmailTemplate(user.firstName, loginUrl);
    await sendgrid.send({ to: user.email, from: { email: process.env.SENDGRID_FROM_EMAIL, name: 'Investiga Sanidad' }, subject: welcomeEmail.subject, html: welcomeEmail.html });


    // NO devolvemos ningún token: el usuario deberá volver a loguearse
    return res
        .status(200)
        .json({ message: "Cuenta verificada correctamente. Por favor, inicia sesión." });
};


exports.login = async (req, res) => {
    try {
        const { id, password } = req.body;
        const user = await User.findOne({ where: { id } });
        if (!user) return res.status(401).json({ message: "Usuario no encontrado" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });
        if (!user.verified) return res.status(401).json({ message: "Cuenta no verificada. Revise su email." });
        const token = jwt.sign({ id: user.id, sub: user.id, roleId: user.roleId }
            , process.env.JWT_SECRET, { expiresIn: "24h" });
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
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

            const resetEmail = getPasswordResetEmailTemplate(user.firstName, resetUrl);
            await sendgrid.send({
                to: user.email,
                from: { email: process.env.SENDGRID_FROM_EMAIL, name: 'Investiga Sanidad' },
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
            return res.status(200).json({ message: "Contraseña actualizada correctamente." });
        }
        return res.status(400).json({ message: "Datos insuficientes." });
    } catch (err) {
        res.status(500).json({ error: "Token inválido o expirado." });
    }
};
