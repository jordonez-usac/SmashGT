const mongoose = require('mongoose');


const playerSchema = new mongoose.Schema({
    puesto: { 
        type: Number, 
        required: true 
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
        required: true 
    }
}, { _id: false }); // Evitamos que Mongoose le asigne un id único a cada jugador del arreglo para mantenerlo limpio

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