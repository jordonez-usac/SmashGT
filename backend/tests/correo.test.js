const { test } = require('node:test');
const assert = require('node:assert/strict');
const { enviarCorreo } = require('../utils/correo');

test('con BREVO_API_KEY envía por la API HTTPS y avisa si Brevo rechaza', async () => {
    const fetchOriginal = global.fetch, entorno = { ...process.env };
    process.env.BREVO_API_KEY = 'clave-de-prueba';
    process.env.EMAIL_USER = 'smashgt@example.com';
    let pedido;
    global.fetch = async (url, opciones) => { pedido = { url, ...opciones }; return { ok: true }; };
    try {
        await enviarCorreo({ to: 'nuevo@example.com', subject: 'Hola', html: '<p>Hola</p>', text: 'Hola' });
        const cuerpo = JSON.parse(pedido.body);
        assert.equal(pedido.url, 'https://api.brevo.com/v3/smtp/email');
        assert.equal(pedido.headers['api-key'], 'clave-de-prueba');
        assert.deepEqual(cuerpo.to, [{ email: 'nuevo@example.com' }]);
        assert.equal(cuerpo.sender.email, 'smashgt@example.com');

        global.fetch = async () => ({ ok: false, status: 401, text: async () => 'Key not found' });
        await assert.rejects(enviarCorreo({ to: 'a@b.c', subject: 's', html: 'h', text: 't' }), /Brevo respondió 401/);
    } finally {
        global.fetch = fetchOriginal;
        process.env = entorno;
    }
});
