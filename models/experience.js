// models/experience.js
const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    dateRange: { type: String, required: true },
    description: { type: String, required: true },
});

module.exports = mongoose.model('Experience', experienceSchema);