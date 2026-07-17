const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    estado: { 
        type: String, 
        enum: ['pendiente', 'aceptada', 'rechazada'], 
        default: 'pendiente' 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Solicitud', solicitudSchema);