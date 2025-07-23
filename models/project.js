// models/project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  tags: [String], // An array of strings
  liveUrl: { type: String },
  sourceUrl: { type: String },
});

module.exports = mongoose.model('Project', projectSchema);