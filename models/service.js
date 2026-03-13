// models/service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    iconSvg: { type: String, required: false }, // Made optional to support images
    imageUrl: { type: String, required: false } // New field for service images
});

module.exports = mongoose.model('Service', serviceSchema);