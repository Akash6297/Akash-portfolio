const mongoose = require('mongoose');

const bookingSettingSchema = new mongoose.Schema({
    // Weekly schedule: Sunday(0) to Saturday(6)
    weeklySchedule: {
        type: Map,
        of: {
            maxBookings: { type: Number, default: 5 },
            slots: { 
                type: [String], 
                default: ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM"] 
            }
        },
        default: () => {
            const defaultDay = {
                maxBookings: 5,
                slots: ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM"]
            };
            return {
                '0': defaultDay, '1': defaultDay, '2': defaultDay, '3': defaultDay,
                '4': defaultDay, '5': defaultDay, '6': defaultDay
            };
        }
    },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BookingSetting', bookingSettingSchema);
