const mongoose = require('mongoose');

const instantaneaSchema = new mongoose.Schema({
    clave: { type: String, required: true, unique: true },
    datos: { type: mongoose.Schema.Types.Mixed, default: null },
    momento: { type: Date, required: true }
});

module.exports = mongoose.model('Instantanea', instantaneaSchema);
