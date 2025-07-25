// models/about.js
const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    bioParagraph1: { type: String, required: true },
    bioParagraph2: { type: String, required: true },
    skills: [String], // An array of strings
});

module.exports = mongoose.model('About', aboutSchema);