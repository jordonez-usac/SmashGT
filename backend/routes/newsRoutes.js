const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { auth } = require('../middlewares/authMiddleware');

router.get('/', newsController.obtenerNoticias);

router.get('/:id', newsController.obtenerNoticiaPorId);

router.post('/:id/like', newsController.darLike);

router.post('/', auth, newsController.crearNoticia);

router.put('/:id', auth, newsController.actualizarNoticia);

router.delete('/:id', auth, newsController.eliminarNoticia);

module.exports = router;