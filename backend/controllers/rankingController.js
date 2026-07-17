const Ranking = require('../models/Ranking');

//crear ranking
exports.crearRanking = async (req, res) => {
    const { titulo, jugadores } = req.body;
    
    try {
        const nuevoRanking = new Ranking({
            titulo,
            jugadores
        });

        const rankingGuardado = await nuevoRanking.save();
        res.status(201).json(rankingGuardado);
    } catch (error) {
        console.log("Error al crear ranking:", error);
        res.status(500).json({ msg: 'Error al crear el ranking', error: error.message });
    }
};

// obtener todos los rankings 
exports.obtenerRankings = async (req, res) => {
    try { 
        const rankings = await Ranking.find().select('-jugadores').sort({ createdAt: -1 });
        res.json(rankings);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener los rankings', error: error.message });
    }
};

// obtener un ranking específico con todos sus jugadores
exports.obtenerRankingPorId = async (req, res) => {
    try {
        const ranking = await Ranking.findById(req.params.id);
        if (!ranking) return res.status(404).json({ msg: 'Ranking no encontrado' });
        
        res.json(ranking);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener el ranking', error: error.message });
    }
};

// actualizar un ranking
exports.actualizarRanking = async (req, res) => {
    try {
        const rankingActualizado = await Ranking.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { returnDocument: 'after' }
        );
        
        if (!rankingActualizado) return res.status(404).json({ msg: 'Ranking no encontrado' });
        res.json(rankingActualizado);
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar el ranking', error: error.message });
    }
};

// eliminar un ranking
exports.eliminarRanking = async (req, res) => {
    try {
        const rankingEliminado = await Ranking.findByIdAndDelete(req.params.id);
        if (!rankingEliminado) return res.status(404).json({ msg: 'Ranking no encontrado' });
        
        res.json({ msg: 'Ranking eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar el ranking', error: error.message });
    }
};