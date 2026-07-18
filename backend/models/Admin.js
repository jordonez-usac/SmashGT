const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    rol: {
        type: String,
        enum: ['principal', 'admin'],
        default: 'admin'
    },
    isFirstLogin: {
        type: Boolean,
        default: true
    },
    passwordTemporalExpira: {
        type: Date,
        default: null
    },
    intentosFallidos: {
        type: Number,
        default: 0
    },
    bloqueadoHasta: {
        type: Date,
        default: null
    },
    tokensValidosDesde: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);
