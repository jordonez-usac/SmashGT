const Torneo = require('../models/Torneo');
const { torneosDeGuatemala } = require('./startggController');

const CAMPOS = ['nombre', 'descripcion', 'fecha', 'fecha_fin', 'lugar', 'imagen', 'url', 'publicado'];

const aFormatoMapa = (t) => ({
    id: String(t._id),
    fuente: 'manual',
    nombre: t.nombre,
    descripcion: t.descripcion || '',
    url: t.url || '',
    imagen: t.imagen || null,
    fecha: t.fecha ? new Date(t.fecha).getTime() : null,
    fecha_fin: t.fecha_fin ? new Date(t.fecha_fin).getTime() : null,
    lugar: t.lugar,
    asistentes: null,
    inscripcion_abierta: null,
    publicado: t.publicado
});

const slugDeStartgg = (url) => (url || '').match(/start\.gg\/(tournament\/[^/?#]+)/)?.[1] || null;

exports.listarParaMapa = async (req, res) => {
    try {
        const [manuales, startgg] = await Promise.allSettled([
            Torneo.find({ publicado: true, $or: [
                { fecha: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                { fecha_fin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
            ] }).sort({ fecha: 1 }).lean(),
            torneosDeGuatemala()
        ]);

        if (manuales.status === 'rejected') throw manuales.reason;

        const propios = manuales.value.map(aFormatoMapa);
        const yaCargados = new Set(propios.map((t) => slugDeStartgg(t.url)).filter(Boolean));

        const deStartgg = startgg.status === 'fulfilled'
            ? startgg.value.filter((t) => !yaCargados.has(t.slug))
            : [];

        if (startgg.status === 'rejected') {
            console.log('Error trayendo torneos de start.gg:', startgg.reason.message);
        }

        res.json({
            torneos: [...propios, ...deStartgg].sort((a, b) => (a.fecha || 0) - (b.fecha || 0)),
            error_startgg: startgg.status === 'rejected' ? 'No se pudieron traer los torneos de start.gg' : null
        });
    } catch (error) {
        console.log('Error al listar torneos:', error);
        res.status(500).json({ msg: 'Error al listar los torneos', error: error.message });
    }
};

exports.listarManuales = async (req, res) => {
    try {
        res.json(await Torneo.find().sort({ fecha: -1 }).lean());
    } catch (error) {
        res.status(500).json({ msg: 'Error al listar los torneos', error: error.message });
    }
};

const soloCamposPermitidos = (cuerpo) =>
    Object.fromEntries(CAMPOS.filter((c) => cuerpo[c] !== undefined).map((c) => [c, cuerpo[c]]));

exports.crearTorneo = async (req, res) => {
    try {
        const torneo = await new Torneo(soloCamposPermitidos(req.body)).save();
        res.status(201).json(torneo);
    } catch (error) {
        console.log('Error al crear torneo:', error);
        res.status(400).json({ msg: 'No se pudo crear el torneo', error: error.message });
    }
};

exports.actualizarTorneo = async (req, res) => {
    try {
        const torneo = await Torneo.findByIdAndUpdate(
            req.params.id,
            soloCamposPermitidos(req.body),
            { new: true, runValidators: true }
        );
        if (!torneo) return res.status(404).json({ msg: 'Torneo no encontrado' });
        res.json(torneo);
    } catch (error) {
        console.log('Error al actualizar torneo:', error);
        res.status(400).json({ msg: 'No se pudo actualizar el torneo', error: error.message });
    }
};

exports.eliminarTorneo = async (req, res) => {
    try {
        const torneo = await Torneo.findByIdAndDelete(req.params.id);
        if (!torneo) return res.status(404).json({ msg: 'Torneo no encontrado' });
        res.json({ msg: 'Torneo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar el torneo', error: error.message });
    }
};
