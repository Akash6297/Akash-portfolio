// models/emailTemplate.js
const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
    templateName: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    htmlContent: { type: String, required: true },
    variables: [String] // e.g., ['{{name}}', '{{message}}']
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);