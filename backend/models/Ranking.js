const mongoose = require('mongoose');

const matchupStatSchema = new mongoose.Schema({
    value: {
        type: String,
        default: ""
    },
    opponent: {
        type: String,
        default: ""
    }
}, { _id: false });

const matchupsSchema = new mongoose.Schema({
    mostWon: { type: matchupStatSchema, default: null },
    mostLost: { type: matchupStatSchema, default: null },
    mostPlayed: { type: matchupStatSchema, default: null },
    bestWinRate: { type: matchupStatSchema, default: null },
    worstWinRate: { type: matchupStatSchema, default: null }
}, { _id: false });

const matchesSchema = new mongoose.Schema({
    winRate: {
        type: String,
        default: "0%"
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    }
}, { _id: false });

const h2hSchema = new mongoose.Schema({
    rival: { type: String, required: true },
    ganados: { type: Number, default: 0 },
    perdidos: { type: Number, default: 0 }
}, { _id: false });

const playerSchema = new mongoose.Schema({
    puesto: {
        type: Number,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    team: {
        type: String,
        default: null
    },
    skin: {
        type: String,
        default: ""
    },
    player_id: {
        type: String,
        default: ""
    },
    braacket_id: {
        type: String,
        default: ""
    },
    url_perfil: {
        type: String,
        default: ""
    },
    puntos: {
        type: Number,
        default: null
    },
    personajes: {
        type: [String],
        default: []
    },
    h2h: {
        type: [h2hSchema],
        default: []
    },
    matchups: {
        type: matchupsSchema,
        default: () => ({})
    },
    matches: {
        type: matchesSchema,
        default: () => ({})
    }
}, { _id: false });

const rankingSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    url_braacket: {
        type: String,
        default: ""
    },
    jugadores: [playerSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Ranking', rankingSchema);
