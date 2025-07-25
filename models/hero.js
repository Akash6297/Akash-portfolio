// models/hero.js
const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
    greeting: { type: String, default: "Hello, I'm Akash Mandal" },
    headline: { type: String, default: "Digital Marketing Specialist & Frontend Developer" },
    bio: { type: String, default: "Results-driven professional..." },
    photoUrl: { type: String, default: "/images/logo.jpeg" },
});

module.exports = mongoose.model('Hero', heroSchema);