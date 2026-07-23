const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const RONDAS = 12;
const LARGO_MINIMO = 10;

const HORAS_VIGENCIA_TEMPORAL = 48;

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

const generarPasswordTemporal = (largo = 14) => {
    const bytes = crypto.randomBytes(largo);
    let salida = '';
    for (let i = 0; i < largo; i++) salida += ALFABETO[bytes[i] % ALFABETO.length];
    return salida;
};

const fechaExpiracionTemporal = () =>
    new Date(Date.now() + HORAS_VIGENCIA_TEMPORAL * 60 * 60 * 1000);

const validarPassword = (password) => {
    if (typeof password !== 'string') return 'La contraseña es obligatoria';
    if (password.length < LARGO_MINIMO) return `La contraseña debe tener al menos ${LARGO_MINIMO} caracteres`;
    if (password.length > 128) return 'La contraseña no puede pasar de 128 caracteres';
    if (!/[a-zA-Z]/.test(password)) return 'La contraseña debe incluir al menos una letra';
    if (!/[0-9]/.test(password)) return 'La contraseña debe incluir al menos un número';
    return null;
};

const hashear = async (password) => bcrypt.hash(password, RONDAS);

const HASH_SEÑUELO = bcrypt.hashSync('contraseña-que-nunca-nadie-usa', RONDAS);

const verificar = async (password, hash) =>
    bcrypt.compare(password ?? '', hash || HASH_SEÑUELO);

module.exports = {
    LARGO_MINIMO,
    HORAS_VIGENCIA_TEMPORAL,
    generarPasswordTemporal,
    fechaExpiracionTemporal,
    validarPassword,
    hashear,
    verificar,
};
