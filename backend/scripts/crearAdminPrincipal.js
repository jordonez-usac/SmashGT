const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Admin = require('../models/Admin');
const { validarPassword, hashear } = require('../utils/password');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const preguntar = (texto) => new Promise((resolve) => rl.question(texto, (r) => resolve(r.trim())));

const preguntarOculto = (texto) => new Promise((resolve) => {
    process.stdout.write(texto);
    const alEscribir = () => process.stdout.write('');
    rl.output.write = alEscribir;
    rl.question('', (respuesta) => {
        rl.output.write = process.stdout.write.bind(process.stdout);
        process.stdout.write('\n');
        resolve(respuesta.trim());
    });
    rl._writeToOutput = alEscribir;
});

const pedirPassword = async () => {
    for (;;) {
        const password = await preguntarOculto('Contraseña: ');
        const motivo = validarPassword(password);
        if (motivo) {
            console.log(`  ✗ ${motivo}`);
            continue;
        }
        const repetida = await preguntarOculto('Repítela: ');
        if (password !== repetida) {
            console.log('  ✗ No coinciden, prueba de nuevo');
            continue;
        }
        return password;
    }
};

const main = async () => {
    if (!process.env.MONGO_URI) {
        console.error('Falta MONGO_URI en el .env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB\n');

    const existente = await Admin.findOne({ rol: 'principal' });

    if (existente) {
        console.log(`Ya hay un administrador principal: ${existente.nombre} <${existente.email}>`);
        const respuesta = (await preguntar('¿Le pones una contraseña nueva? (s/N): ')).toLowerCase();
        if (respuesta !== 's' && respuesta !== 'si') {
            console.log('No se cambió nada.');
            return;
        }

        existente.password = await hashear(await pedirPassword());
        existente.isFirstLogin = false;
        existente.passwordTemporalExpira = null;
        existente.intentosFallidos = 0;
        existente.bloqueadoHasta = null;
        existente.tokensValidosDesde = new Date();
        await existente.save();

        console.log('\n✓ Contraseña actualizada. Las sesiones anteriores quedaron cerradas.');
        return;
    }

    console.log('No hay administrador principal. Vamos a crearlo.\n');

    const nombre = await preguntar('Nombre: ');
    const email = (await preguntar('Correo: ')).toLowerCase();

    if (!nombre || !email) {
        console.error('El nombre y el correo son obligatorios');
        process.exitCode = 1;
        return;
    }

    const yaExiste = await Admin.findOne({ email });
    if (yaExiste) {
        const respuesta = (await preguntar(`Ese correo ya es admin. ¿Lo vuelves principal? (s/N): `)).toLowerCase();
        if (respuesta !== 's' && respuesta !== 'si') {
            console.log('No se cambió nada.');
            return;
        }
        yaExiste.rol = 'principal';
        yaExiste.password = await hashear(await pedirPassword());
        yaExiste.isFirstLogin = false;
        yaExiste.passwordTemporalExpira = null;
        yaExiste.tokensValidosDesde = new Date();
        await yaExiste.save();
        console.log(`\n✓ ${yaExiste.email} ahora es el administrador principal.`);
        return;
    }

    const password = await pedirPassword();

    await Admin.create({
        nombre,
        email,
        password: await hashear(password),
        rol: 'principal',
        isFirstLogin: false
    });

    console.log(`\n✓ Administrador principal creado: ${nombre} <${email}>`);
    console.log('  A este correo le van a llegar las solicitudes de acceso.');
};

main()
    .catch((error) => {
        console.error('\nError:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        rl.close();
        await mongoose.disconnect();
    });
