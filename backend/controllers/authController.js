const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// config correo
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const CORREO_ADMIN = 'jmosjroh06@gmail.com'; // aqui enviamos las solicitudes de registro

// controller para manejar la autenticación de administradores
exports.solicitarRegistro = async (req, res) => {
    const { nombre, email } = req.body;

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: CORREO_ADMIN,
            subject: 'Nueva solicitud de registro de Administrador',
            text: `El usuario ${nombre} con el correo ${email} ha solicitado acceso de administrador a la plataforma de Smash Guatemala.`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ msg: 'Solicitud enviada al administrador principal' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al enviar la solicitud', error });
    }
};

// El admin aprueba y crea la cuenta , generando tambien una contraseña aleatoria.
exports.crearAdmin = async (req, res) => {
    const { nombre, email } = req.body;

    try {
        let admin = await Admin.findOne({ email });
        if (admin) return res.status(400).json({ msg: 'El administrador ya existe' });

        // generar contraseña aleatoria segura
        const randomPassword = crypto.randomBytes(8).toString('hex');
        
        // hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        admin = new Admin({
            nombre,
            email,
            password: hashedPassword
        });

        await admin.save();

        // enviar contraseña al correo del nuevo administrador
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Tu cuenta de Administrador ha sido creada',
            text: `Hola ${nombre},\n\nTu cuenta ha sido aprobada. Tu contraseña temporal es: ${randomPassword}\n\nPor favor inicia sesión y cámbiala inmediatamente.`
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json({ msg: 'Administrador creado y correo enviado exitosamente' });

    } catch (error) {
        res.status(500).json({ msg: 'Error al crear el administrador', error });
    }
};

// Login del admin
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ msg: 'Credenciales inválidas' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ msg: 'Credenciales inválidas' });

        // Generar JWT
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            admin: {
                id: admin._id,
                nombre: admin.nombre,
                email: admin.email,
                isFirstLogin: admin.isFirstLogin // Frontend validará esto para forzar redirección
            }
        });
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error });
    }
};

// Cambiar la contraseña (Obligatorio en el primer login o a gusto)
exports.cambiarPassword = async (req, res) => {
    const { nuevaPassword } = req.body;
    const adminId = req.admin.id; // Vendrá del middleware del JWT

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nuevaPassword, salt);

        await Admin.findByIdAndUpdate(adminId, { 
            password: hashedPassword, 
            isFirstLogin: false 
        });

        res.json({ msg: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar la contraseña', error });
    }
};