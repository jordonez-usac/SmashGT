const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Solicitud = require('../models/Solicitud');
const { enviarCorreo, escapar } = require('../utils/correo');
const { SCOPE_INICIAL } = require('../middlewares/authMiddleware');
const {
    HORAS_VIGENCIA_TEMPORAL,
    generarPasswordTemporal,
    fechaExpiracionTemporal,
    validarPassword,
    hashear,
    verificar,
} = require('../utils/password');

const DIAS_SESION = 7;
const MINUTOS_SESION_INICIAL = 20;
const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const urlFrontend = () => (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');

const obtenerPrincipal = () => Admin.findOne({ rol: 'principal' });

const firmarToken = (admin, { inicial = false } = {}) =>
    jwt.sign(
        inicial ? { id: admin._id, scope: SCOPE_INICIAL } : { id: admin._id, rol: admin.rol },
        process.env.JWT_SECRET,
        { expiresIn: inicial ? `${MINUTOS_SESION_INICIAL}m` : `${DIAS_SESION}d` }
    );

const perfilPublico = (admin) => ({
    id: admin._id,
    nombre: admin.nombre,
    email: admin.email,
    rol: admin.rol,
    isFirstLogin: admin.isFirstLogin
});

exports.solicitarRegistro = async (req, res) => {
    const nombre = String(req.body.nombre || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const motivo = String(req.body.motivo || '').trim().slice(0, 500);

    if (nombre.length < 3 || nombre.length > 80) {
        return res.status(400).json({ msg: 'Escribe tu nombre (entre 3 y 80 caracteres)' });
    }
    if (!EMAIL_VALIDO.test(email)) {
        return res.status(400).json({ msg: 'El correo no tiene un formato válido' });
    }

    const respuestaGenerica = {
        msg: 'Si el correo es válido, tu solicitud le llegó al administrador principal. Te avisamos por correo cuando la revise.'
    };

    try {
        const [yaEsAdmin, pendiente] = await Promise.all([
            Admin.exists({ email }),
            Solicitud.exists({ email, estado: 'pendiente' })
        ]);
        if (yaEsAdmin || pendiente) return res.json(respuestaGenerica);

        const solicitud = await Solicitud.create({ nombre, email, motivo });

        const principal = await obtenerPrincipal();
        if (!principal) {
            console.error('No hay ningún admin principal en la base: corre `npm run crear-principal`');
            return res.json(respuestaGenerica);
        }

        const enlace = `${urlFrontend()}/gestionar-solicitud/${solicitud._id}`;

        await enviarCorreo({
            to: principal.email,
            subject: 'SmashGT · nueva solicitud de acceso al panel',
            html: `
                <h3>Nueva solicitud de acceso</h3>
                <p><strong>Nombre:</strong> ${escapar(nombre)}</p>
                <p><strong>Correo:</strong> ${escapar(email)}</p>
                ${motivo ? `<p><strong>Motivo:</strong> ${escapar(motivo)}</p>` : ''}
                <p>Para aceptarla o rechazarla, entra al panel:</p>
                <p><a href="${enlace}">${enlace}</a></p>
                <p style="color:#666;font-size:12px">
                    El enlace pide tu sesión de administrador principal: nadie más puede resolverla.
                </p>
            `,
            text: `Nueva solicitud de acceso\nNombre: ${nombre}\nCorreo: ${email}\n${motivo ? `Motivo: ${motivo}\n` : ''}\nResuélvela en: ${enlace}`
        });

        res.json(respuestaGenerica);
    } catch (error) {
        if (error?.code === 11000) return res.json(respuestaGenerica);

        console.error('Error al registrar la solicitud:', error);
        res.status(500).json({ msg: 'No se pudo procesar la solicitud, intenta más tarde' });
    }
};

exports.listarSolicitudes = async (req, res) => {
    try {
        const solicitudes = await Solicitud.find()
            .populate('resueltaPor', 'nombre')
            .sort({ estado: 1, createdAt: -1 });
        res.json(solicitudes);
    } catch (error) {
        console.error('Error al listar solicitudes:', error);
        res.status(500).json({ msg: 'Error al obtener las solicitudes' });
    }
};

exports.obtenerSolicitud = async (req, res) => {
    try {
        const solicitud = await Solicitud.findById(req.params.id).populate('resueltaPor', 'nombre');
        if (!solicitud) return res.status(404).json({ msg: 'Solicitud no encontrada' });
        res.json(solicitud);
    } catch (error) {
        if (error?.name === 'CastError') return res.status(404).json({ msg: 'Solicitud no encontrada' });
        console.error('Error al obtener la solicitud:', error);
        res.status(500).json({ msg: 'Error al obtener la solicitud' });
    }
};

exports.procesarSolicitud = async (req, res) => {
    const { accion } = req.body;
    const { id } = req.params;

    if (accion !== 'aceptar' && accion !== 'rechazar') {
        return res.status(400).json({ msg: 'Acción no válida, usa "aceptar" o "rechazar"' });
    }

    try {
        const solicitud = await Solicitud.findById(id);
        if (!solicitud) return res.status(404).json({ msg: 'Solicitud no encontrada' });
        if (solicitud.estado !== 'pendiente') {
            return res.status(409).json({ msg: `Esta solicitud ya fue ${solicitud.estado}` });
        }

        if (accion === 'rechazar') {
            solicitud.estado = 'rechazada';
            solicitud.resueltaPor = req.admin.id;
            solicitud.resueltaEn = new Date();
            await solicitud.save();

            try {
                await enviarCorreo({
                    to: solicitud.email,
                    subject: 'SmashGT · sobre tu solicitud de acceso',
                    text: `Hola ${solicitud.nombre},\n\nTu solicitud de acceso al panel de SmashGT no fue aprobada por ahora.\n\nGracias por el interés.`
                });
            } catch (err) {
                console.error('Solicitud rechazada, pero el correo de aviso falló:', err.message);
            }

            return res.json({ msg: 'Solicitud rechazada', solicitud });
        }

        if (await Admin.exists({ email: solicitud.email })) {
            solicitud.estado = 'aceptada';
            solicitud.resueltaPor = req.admin.id;
            solicitud.resueltaEn = new Date();
            await solicitud.save();
            return res.status(409).json({ msg: 'Ese correo ya tiene una cuenta de administrador' });
        }

        const passwordTemporal = generarPasswordTemporal();
        const nuevoAdmin = await Admin.create({
            nombre: solicitud.nombre,
            email: solicitud.email,
            password: await hashear(passwordTemporal),
            rol: 'admin',
            isFirstLogin: true,
            passwordTemporalExpira: fechaExpiracionTemporal()
        });

        try {
            await enviarCorreo({
                to: nuevoAdmin.email,
                subject: 'SmashGT · tu acceso al panel fue aprobado',
                html: `
                    <h3>Hola ${escapar(nuevoAdmin.nombre)}, tu acceso fue aprobado</h3>
                    <p>Entra con este correo y la contraseña temporal:</p>
                    <p style="font-size:20px;font-family:monospace;letter-spacing:2px"><strong>${escapar(passwordTemporal)}</strong></p>
                    <p>Vence en ${HORAS_VIGENCIA_TEMPORAL} horas. Al entrar, el panel te va a pedir que definas tu contraseña definitiva antes de dejarte hacer cualquier otra cosa.</p>
                    <p><a href="${urlFrontend()}/admin">Entrar al panel</a></p>
                `,
                text: `Hola ${nuevoAdmin.nombre},\n\nTu acceso al panel de SmashGT fue aprobado.\n\nCorreo: ${nuevoAdmin.email}\nContraseña temporal: ${passwordTemporal}\n\nVence en ${HORAS_VIGENCIA_TEMPORAL} horas. Al entrar tendrás que definir tu contraseña definitiva.\n\n${urlFrontend()}/admin`
            });
        } catch (err) {
            await Admin.findByIdAndDelete(nuevoAdmin._id);
            console.error('No se pudo enviar la contraseña temporal:', err.message);
            return res.status(502).json({
                msg: 'No se pudo enviar el correo con la contraseña temporal. La solicitud sigue pendiente, prueba de nuevo.'
            });
        }

        solicitud.estado = 'aceptada';
        solicitud.resueltaPor = req.admin.id;
        solicitud.resueltaEn = new Date();
        await solicitud.save();

        res.status(201).json({
            msg: `Administrador creado. La contraseña temporal se envió a ${nuevoAdmin.email}`,
            solicitud
        });
    } catch (error) {
        if (error?.name === 'CastError') return res.status(404).json({ msg: 'Solicitud no encontrada' });
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ msg: 'Error al procesar la solicitud' });
    }
};

exports.login = async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    const credencialesInvalidas = () => res.status(401).json({ msg: 'Correo o contraseña incorrectos' });

    try {
        const admin = await Admin.findOne({ email }).select('+password');

        if (admin?.bloqueadoHasta && admin.bloqueadoHasta > new Date()) {
            const minutos = Math.ceil((admin.bloqueadoHasta - Date.now()) / 60000);
            return res.status(429).json({
                msg: `Demasiados intentos fallidos. Prueba de nuevo en ${minutos} minuto(s).`
            });
        }

        const coincide = await verificar(password, admin?.password);

        if (!admin || !coincide) {
            if (admin) {
                admin.intentosFallidos += 1;
                if (admin.intentosFallidos >= MAX_INTENTOS) {
                    admin.bloqueadoHasta = new Date(Date.now() + MINUTOS_BLOQUEO * 60 * 1000);
                    admin.intentosFallidos = 0;
                }
                await admin.save();
            }
            return credencialesInvalidas();
        }

        if (admin.isFirstLogin && admin.passwordTemporalExpira && admin.passwordTemporalExpira < new Date()) {
            return res.status(403).json({
                msg: 'Tu contraseña temporal venció. Pídele al administrador principal que te habilite de nuevo.'
            });
        }

        if (admin.intentosFallidos || admin.bloqueadoHasta) {
            admin.intentosFallidos = 0;
            admin.bloqueadoHasta = null;
            await admin.save();
        }

        const token = firmarToken(admin, { inicial: admin.isFirstLogin });

        res.json({
            token,
            requiereCambioPassword: admin.isFirstLogin,
            admin: perfilPublico(admin)
        });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

exports.cambiarPassword = async (req, res) => {
    const { passwordActual, nuevaPassword } = req.body;

    const motivo = validarPassword(nuevaPassword);
    if (motivo) return res.status(400).json({ msg: motivo });

    try {
        const admin = await Admin.findById(req.admin.id).select('+password');
        if (!admin) return res.status(404).json({ msg: 'La cuenta ya no existe' });

        if (!(await verificar(passwordActual, admin.password))) {
            return res.status(401).json({ msg: 'La contraseña actual no es correcta' });
        }
        if (passwordActual === nuevaPassword) {
            return res.status(400).json({ msg: 'La contraseña nueva tiene que ser distinta de la actual' });
        }

        admin.password = await hashear(nuevaPassword);
        admin.isFirstLogin = false;
        admin.passwordTemporalExpira = null;
        admin.intentosFallidos = 0;
        admin.bloqueadoHasta = null;
        admin.tokensValidosDesde = new Date();
        await admin.save();

        res.json({
            msg: 'Contraseña actualizada',
            token: firmarToken(admin),
            admin: perfilPublico(admin)
        });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        res.status(500).json({ msg: 'Error al actualizar la contraseña' });
    }
};

exports.yo = (req, res) => {
    res.json({ admin: req.admin });
};

exports.actualizarPerfil = async (req, res) => {
    const nombre = String(req.body.nombre || '').trim();
    if (nombre.length < 3 || nombre.length > 80) {
        return res.status(400).json({ msg: 'El nombre debe tener entre 3 y 80 caracteres' });
    }

    try {
        const admin = await Admin.findByIdAndUpdate(req.admin.id, { nombre }, { returnDocument: 'after', runValidators: true });
        if (!admin) return res.status(404).json({ msg: 'La cuenta ya no existe' });
        res.json({ msg: 'Datos actualizados', admin: perfilPublico(admin) });
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(500).json({ msg: 'Error al actualizar tus datos' });
    }
};
