const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    autor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Admin', 
        required: true 
    },
    titulo: { 
        type: String, 
        required: true 
    },
    descripcion: { 
        type: String, 
        required: true 
    },
    contenido: { 
        type: String, 
        required: true 
    },
    likes: { 
        type: Number, 
        default: 0 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('News', newsSchema);