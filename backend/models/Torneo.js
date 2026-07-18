const mongoose = require('mongoose');

const LIMITES = { lat: [13.6, 17.9], lng: [-92.4, -88.1] };

const lugarSchema = new mongoose.Schema({
    nombre: { type: String, default: '' },
    direccion: { type: String, default: '' },
    ciudad: { type: String, default: '' },
    lat: { type: Number, required: true, min: LIMITES.lat[0], max: LIMITES.lat[1] },
    lng: { type: Number, required: true, min: LIMITES.lng[0], max: LIMITES.lng[1] }
}, { _id: false });

const torneoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    fecha: { type: Date, required: true },
    fecha_fin: { type: Date, default: null },
    lugar: { type: lugarSchema, required: true },
    imagen: { type: String, default: '' },
    url: { type: String, default: '' },
    publicado: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Torneo', torneoSchema);
module.exports.LIMITES = LIMITES;
