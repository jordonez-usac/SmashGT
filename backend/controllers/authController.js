const Admin = require('../models/Admin');
const Solicitud = require('../models/Solicitud');
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
        
        const adminExistente = await Admin.findOne({ email });
        if (adminExistente) return res.status(400).json({ msg: 'Este correo ya es administrador' });

        // Guardar la solicitud en la base de datos
        const nuevaSolicitud = new Solicitud({ nombre, email });
        await nuevaSolicitud.save();

        
        const urlFrontend = `http://localhost:3000/gestionar-solicitud/${nuevaSolicitud._id}`; //url temporal... pendiente

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: CORREO_ADMIN,
            subject: 'Nueva solicitud de registro de Administrador',
            html: `
                <h3>Nueva solicitud de acceso</h3>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Correo:</strong> ${email}</p>
                <br>
                <p>Para aceptar o rechazar esta solicitud, ingresa al siguiente enlace:</p>
                <a href="${urlFrontend}">${urlFrontend}</a>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ msg: 'Solicitud enviada al administrador principal' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al procesar la solicitud', error });
    }
};

exports.procesarSolicitud = async (req, res) => {
    
    const { accion } = req.body; 
    const { id } = req.params;

    try {
        const solicitud = await Solicitud.findById(id);
        if (!solicitud) return res.status(404).json({ msg: 'Solicitud no encontrada' });
        if (solicitud.estado !== 'pendiente') return res.status(400).json({ msg: `Esta solicitud ya fue ${solicitud.estado}` });

        if (accion === 'rechazar') {
            solicitud.estado = 'rechazada';
            await solicitud.save();
            return res.json({ msg: 'La solicitud ha sido rechazada exitosamente' });
        }

        if (accion === 'aceptar') {
            // Generar contraseña y crear el admin
            const randomPassword = crypto.randomBytes(8).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            const nuevoAdmin = new Admin({
                nombre: solicitud.nombre,
                email: solicitud.email,
                password: hashedPassword
            });

            await nuevoAdmin.save();

            // Cambiar estado de la solicitud
            solicitud.estado = 'aceptada';
            await solicitud.save();

            // Enviar la contraseña al nuevo admin
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: solicitud.email,
                subject: 'Tu cuenta de Administrador en SmashGT ha sido aprobada',
                text: `Hola ${solicitud.nombre},\n\nTu cuenta ha sido aprobada. Tu contraseña temporal es: ${randomPassword}\n\nPor favor inicia sesión y cámbiala.`
            };

            await transporter.sendMail(mailOptions);
            return res.status(201).json({ msg: 'Administrador creado y correo enviado exitosamente' });
        }

        res.status(400).json({ msg: 'Acción no válida. Usa "aceptar" o "rechazar".' });

    } catch (error) {
        res.status(500).json({ msg: 'Error al procesar la solicitud', error });
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