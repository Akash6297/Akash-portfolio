const mongoose = require('mongoose');
const Booking = require('./models/booking');
require('dotenv').config();

async function verifyFix() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const testDate = '2026-03-14';

        // 1. Attempt to create first booking
        console.log(`Creating first booking for ${testDate} at 10:00 AM...`);
        const b1 = new Booking({
            name: 'Test 1',
            email: 'test1@example.com',
            date: testDate,
            time: '10:00 AM',
            message: 'First test'
        });
        await b1.save();
        console.log('First booking saved.');

        // 2. Attempt to create second booking on same day, different time
        console.log(`Creating second booking for ${testDate} at 11:00 AM...`);
        const b2 = new Booking({
            name: 'Test 2',
            email: 'test2@example.com',
            date: testDate,
            time: '11:00 AM',
            message: 'Second test'
        });
        await b2.save();
        console.log('Second booking saved successfully! Duplicate key error on timeSlot is fixed.');

        // 3. Cleanup
        console.log('Cleaning up test bookings...');
        await Booking.deleteMany({ date: testDate, name: { $in: ['Test 1', 'Test 2'] } });
        console.log('Cleanup done.');

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        // Attempt cleanup anyway
        try {
            const Booking = require('./models/booking');
            await Booking.deleteMany({ date: '2026-03-14', name: { $in: ['Test 1', 'Test 2'] } });
        } catch (e) {}
        process.exit(1);
    }
}

verifyFix();
