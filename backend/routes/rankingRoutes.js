const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const auth = require('../middlewares/authMiddleware');



//publica
router.get('/', rankingController.obtenerRankings);

//publica
router.get('/:id', rankingController.obtenerRankingPorId);

//protegida
router.post('/', auth, rankingController.crearRanking);

//protegida
router.put('/:id', auth, rankingController.actualizarRanking);

//protegida
router.delete('/:id', auth, rankingController.eliminarRanking);

module.exports = router;