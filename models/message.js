// models/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    replied: { type: Boolean, default: false }
}, { timestamps: true }); // `timestamps: true` automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Message', messageSchema);