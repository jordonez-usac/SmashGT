const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    isFirstLogin: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Admin', adminSchema);