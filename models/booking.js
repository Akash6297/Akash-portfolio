const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: HH:MM
    message: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'rejected', 'completed'], 
        default: 'pending' 
    },
    createdAt: { type: Date, default: Date.now }
});

// Ensure a person cannot book the same slot twice
bookingSchema.index({ date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
