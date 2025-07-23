// models/service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    iconSvg: { type: String, required: true }, // We'll store the SVG content as a string
});

module.exports = mongoose.model('Service', serviceSchema);