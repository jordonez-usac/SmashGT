const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware'); 

//publica
router.post('/solicitar', authController.solicitarRegistro);


//publica
router.post('/login', authController.login);

//protegida
router.put('/cambiar-password', auth, authController.cambiarPassword);

//protegida
router.post('/solicitudes/:id/responder', auth, authController.procesarSolicitud);


module.exports = router;