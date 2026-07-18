const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    motivo: {
        type: String,
        default: '',
        trim: true,
        maxlength: 500
    },
    estado: {
        type: String,
        enum: ['pendiente', 'aceptada', 'rechazada'],
        default: 'pendiente'
    },
    resueltaPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    resueltaEn: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

solicitudSchema.index(
    { email: 1 },
    { unique: true, partialFilterExpression: { estado: 'pendiente' } }
);

module.exports = mongoose.model('Solicitud', solicitudSchema);
