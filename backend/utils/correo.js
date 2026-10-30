const nodemailer = require('nodemailer');

let transporter = null;

const obtenerTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Faltan EMAIL_USER / EMAIL_PASS en el .env, no se puede enviar correo');
    }
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
};

const escapar = (texto) =>
    String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const enviarCorreo = async ({ to, subject, html, text }) => {
    const t = obtenerTransporter();
    await t.sendMail({
        from: `"SmashGT" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text
    });
};

module.exports = { enviarCorreo, escapar };
