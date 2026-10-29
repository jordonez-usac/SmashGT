const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const { auth } = require('../middlewares/authMiddleware');

router.get('/', rankingController.obtenerRankings);

router.get('/jugadores', rankingController.obtenerJugadores);

router.get('/:id', rankingController.obtenerRankingPorId);

router.post('/', auth, rankingController.crearRanking);

router.put('/:id', auth, rankingController.actualizarRanking);

router.delete('/:id', auth, rankingController.eliminarRanking);

module.exports = router;