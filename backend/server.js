const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { limiteGeneral } = require('./middlewares/rateLimit');

dotenv.config();

const REQUERIDAS = ['MONGO_URI', 'JWT_SECRET'];
const faltantes = REQUERIDAS.filter((clave) => !process.env[clave]);
if (faltantes.length) {
    console.error(`Faltan variables en el .env: ${faltantes.join(', ')}`);
    process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET es muy corto. Usa al menos 32 caracteres aleatorios: openssl rand -base64 48');
    process.exit(1);
}

connectDB();

const app = express();

if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);

app.use(helmet());

const ORIGENES = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ORIGENES.includes(origin.replace(/\/+$/, ''))) return callback(null, true);
        callback(new Error('Origen no permitido por CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '6mb' }));

app.use('/api', limiteGeneral);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/rankings', require('./routes/rankingRoutes'));
app.use('/api/jugadores', require('./routes/jugadorRoutes'));
app.use('/api/torneos', require('./routes/torneoRoutes'));

app.use((err, req, res, _next) => {
    console.error('Error no controlado:', err);
    if (err.message === 'Origen no permitido por CORS') {
        return res.status(403).json({ msg: 'Origen no permitido' });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ msg: 'El contenido es demasiado grande' });
    }
    res.status(500).json({ msg: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
