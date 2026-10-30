const { test } = require('node:test');
const assert = require('node:assert/strict');
const Admin = require('../models/Admin');
const { actualizarPerfil } = require('../controllers/authController');

const respuesta = () => {
    const res = { codigo: 200 };
    res.status = (codigo) => { res.codigo = codigo; return res; };
    res.json = (cuerpo) => { res.cuerpo = cuerpo; return res; };
    return res;
};

test('actualizarPerfil cambia el nombre y rechaza nombres inválidos', async () => {
    const original = Admin.findByIdAndUpdate;
    let cambio;
    Admin.findByIdAndUpdate = async (id, datos) => {
        cambio = { id, ...datos };
        return { _id: id, email: 'a@b.com', rol: 'admin', isFirstLogin: false, ...datos };
    };
    try {
        const ok = respuesta();
        await actualizarPerfil({ admin: { id: 'x1' }, body: { nombre: '  Juan GT  ' } }, ok);
        assert.deepEqual(cambio, { id: 'x1', nombre: 'Juan GT' });
        assert.equal(ok.cuerpo.admin.nombre, 'Juan GT');

        cambio = null;
        const corto = respuesta();
        await actualizarPerfil({ admin: { id: 'x1' }, body: { nombre: 'J ' } }, corto);
        assert.equal(corto.codigo, 400);
        assert.equal(cambio, null);
    } finally {
        Admin.findByIdAndUpdate = original;
    }
});
