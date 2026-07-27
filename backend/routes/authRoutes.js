const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, authCambioPassword, soloPrincipal } = require('../middlewares/authMiddleware');
const { limiteLogin, limiteSolicitud, limiteCambioPassword } = require('../middlewares/rateLimit');

router.post('/solicitar', limiteSolicitud, authController.solicitarRegistro);

router.post('/login', limiteLogin, authController.login);

router.put('/cambiar-password', limiteCambioPassword, authCambioPassword, authController.cambiarPassword);

router.get('/yo', auth, authController.yo);

router.get('/solicitudes', auth, soloPrincipal, authController.listarSolicitudes);
router.get('/solicitudes/:id', auth, soloPrincipal, authController.obtenerSolicitud);
router.post('/solicitudes/:id/responder', auth, soloPrincipal, authController.procesarSolicitud);

module.exports = router;
