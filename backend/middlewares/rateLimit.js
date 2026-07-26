const rateLimit = require('express-rate-limit');

const comun = {
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Demasiadas peticiones, espera un momento antes de volver a intentar' }
};

const limiteLogin = rateLimit({
    ...comun,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true
});

const limiteSolicitud = rateLimit({
    ...comun,
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message: { msg: 'Ya mandaste varias solicitudes. Espera una hora antes de volver a intentar.' }
});

const limiteCambioPassword = rateLimit({
    ...comun,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true
});

const limiteStartgg = rateLimit({
    ...comun,
    windowMs: 10 * 60 * 1000,
    limit: 120
});

const limiteGeneral = rateLimit({
    ...comun,
    windowMs: 15 * 60 * 1000,
    limit: 600
});

module.exports = {
    limiteLogin,
    limiteSolicitud,
    limiteCambioPassword,
    limiteStartgg,
    limiteGeneral
};
