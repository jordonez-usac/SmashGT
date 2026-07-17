const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const auth = require('../middlewares/authMiddleware');


//publica
router.get('/', newsController.obtenerNoticias);

//publica
router.post('/:id/like', newsController.darLike);

//protegida
router.post('/', auth, newsController.crearNoticia);

//protegida
router.put('/:id', auth, newsController.actualizarNoticia);

//protegida
router.delete('/:id', auth, newsController.eliminarNoticia);

module.exports = router;