const Ranking = require('../models/Ranking');
const { mergeJugadores } = require('../utils/mergeJugadores');

exports.crearRanking = async (req, res) => {
    const { titulo, jugadores, url_braacket } = req.body;

    try {
        const nuevoRanking = new Ranking({
            titulo,
            url_braacket,
            jugadores
        });

        const rankingGuardado = await nuevoRanking.save();
        res.status(201).json(rankingGuardado);
    } catch (error) {
        console.log("Error al crear ranking:", error);
        res.status(500).json({ msg: 'Error al crear el ranking', error: error.message });
    }
};

exports.obtenerRankings = async (req, res) => {
    try {
        const rankings = await Ranking.find().select('-jugadores').sort({ createdAt: -1 });
        res.json(rankings);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener los rankings', error: error.message });
    }
};

exports.obtenerRankingPorId = async (req, res) => {
    try {
        const ranking = await Ranking.findById(req.params.id);
        if (!ranking) return res.status(404).json({ msg: 'Ranking no encontrado' });

        res.json(ranking);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener el ranking', error: error.message });
    }
};

exports.actualizarRanking = async (req, res) => {
    try {
        const ranking = await Ranking.findById(req.params.id);
        if (!ranking) return res.status(404).json({ msg: 'Ranking no encontrado' });

        const { titulo, url_braacket, jugadores, reemplazar_h2h } = req.body;

        if (titulo !== undefined) ranking.titulo = titulo;
        if (url_braacket !== undefined) ranking.url_braacket = url_braacket;

        if (Array.isArray(jugadores)) {
            ranking.jugadores = mergeJugadores(
                ranking.toObject().jugadores,
                jugadores,
                { prioridadEdiciones: 'nuevo', reemplazarH2H: reemplazar_h2h === true }
            );
        }

        const rankingActualizado = await ranking.save();
        res.json(rankingActualizado);
    } catch (error) {
        console.log("Error al actualizar ranking:", error);
        res.status(500).json({ msg: 'Error al actualizar el ranking', error: error.message });
    }
};

exports.eliminarRanking = async (req, res) => {
    try {
        const rankingEliminado = await Ranking.findByIdAndDelete(req.params.id);
        if (!rankingEliminado) return res.status(404).json({ msg: 'Ranking no encontrado' });

        res.json({ msg: 'Ranking eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar el ranking', error: error.message });
    }
};