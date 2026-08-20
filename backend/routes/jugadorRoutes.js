const express = require('express');
const router = express.Router();
const startggController = require('../controllers/startggController');
const { limiteStartgg } = require('../middlewares/rateLimit');
const { auth } = require('../middlewares/authMiddleware');

router.get('/main/:id', auth, limiteStartgg, startggController.detectarMain);

router.post('/buscar', auth, limiteStartgg, startggController.buscarJugadores);

router.get('/resolver/:identificador', auth, limiteStartgg, startggController.resolverJugador);

router.get('/:identificador', limiteStartgg, startggController.obtenerJugador);

module.exports = router;
