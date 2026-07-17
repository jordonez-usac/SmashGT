const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    puesto: { 
        type: Number, 
        required: true 
    },
    team: { 
        type: String, 
        default: null 
    },
    nombre: { 
        type: String, 
        required: true 
    },
    skin: { 
        type: String, 
        required: true 
    },
    player_id: { 
        type: String, 
        required: true // El ID clave para conectar con start.gg
    }
}, { _id: false }); 

const rankingSchema = new mongoose.Schema({
    titulo: { 
        type: String, 
        required: true 
    },
    jugadores: [playerSchema] 
}, {
    timestamps: true
});

module.exports = mongoose.model('Ranking', rankingSchema);