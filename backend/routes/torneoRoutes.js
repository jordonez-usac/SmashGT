const express = require('express');
const router = express.Router();
const torneoController = require('../controllers/torneoController');
const { auth } = require('../middlewares/authMiddleware');
const { listarResultados } = require('../controllers/startggController');
const { limiteStartgg } = require('../middlewares/rateLimit');

router.get('/', torneoController.listarParaMapa);

router.get('/resultados', limiteStartgg, listarResultados);

router.get('/manuales', auth, torneoController.listarManuales);

router.post('/', auth, torneoController.crearTorneo);

router.put('/:id', auth, torneoController.actualizarTorneo);

router.delete('/:id', auth, torneoController.eliminarTorneo);

module.exports = router;
