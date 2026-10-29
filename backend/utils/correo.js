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

// Render gratis bloquea SMTP. Sin BREVO_API_KEY (en local) se usa Gmail.
const enviarPorBrevo = async ({ to, subject, html, text }) => {
    if (!process.env.EMAIL_USER) throw new Error('Falta EMAIL_USER: es el remitente verificado en Brevo');
    const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
            sender: { name: 'SmashGT', email: process.env.EMAIL_USER },
            to: [{ email: to }],
            subject,
            htmlContent: html,
            textContent: text
        }),
        signal: AbortSignal.timeout(15000)
    });
    if (!respuesta.ok) throw new Error(`Brevo respondió ${respuesta.status}: ${(await respuesta.text()).slice(0, 200)}`);
};

const enviarCorreo = async ({ to, subject, html, text }) => {
    if (process.env.BREVO_API_KEY) return enviarPorBrevo({ to, subject, html, text });
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
