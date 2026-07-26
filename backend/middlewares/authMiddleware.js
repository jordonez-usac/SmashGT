const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const SCOPE_INICIAL = 'password-inicial';

const noAutorizado = (res, msg = 'Sesión no válida, vuelve a iniciar sesión') =>
    res.status(401).json({ msg });

const verificarSesion = async (req, res, { permitirInicial }) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return () => res.status(401).json({ msg: 'Necesitas un token, permiso denegado' });
    }

    let decoded;
    try {
        decoded = jwt.verify(authHeader.slice(7).trim(), process.env.JWT_SECRET);
    } catch {
        return () => noAutorizado(res, 'El token no es válido o ya expiró');
    }

    if (decoded.scope === SCOPE_INICIAL && !permitirInicial) {
        return () => res.status(403).json({
            msg: 'Todavía tienes la contraseña temporal. Cambiala antes de usar el panel.',
            requiereCambioPassword: true
        });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) return () => noAutorizado(res, 'La cuenta ya no existe');

    const emitidoEn = decoded.iat * 1000;
    if (admin.tokensValidosDesde && emitidoEn < admin.tokensValidosDesde.getTime() - 1000) {
        return () => noAutorizado(res, 'La sesión fue cerrada, inicia sesión de nuevo');
    }

    req.admin = {
        id: admin._id.toString(),
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
        isFirstLogin: admin.isFirstLogin
    };
    return null;
};

const construirMiddleware = (permitirInicial) => async (req, res, next) => {
    try {
        const error = await verificarSesion(req, res, { permitirInicial });
        if (error) return error();
        next();
    } catch (err) {
        console.error('Error verificando la sesión:', err);
        res.status(500).json({ msg: 'Error al verificar la sesión' });
    }
};

const auth = construirMiddleware(false);

const authCambioPassword = construirMiddleware(true);

const soloPrincipal = (req, res, next) => {
    if (req.admin?.rol !== 'principal') {
        return res.status(403).json({ msg: 'Solo el administrador principal puede hacer esto' });
    }
    next();
};

module.exports = { auth, authCambioPassword, soloPrincipal, SCOPE_INICIAL };
