// models/certification.js
const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String, required: true },
    credentialId: { type: String },
    credentialUrl: { type: String },
    imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Certification', certificationSchema);
