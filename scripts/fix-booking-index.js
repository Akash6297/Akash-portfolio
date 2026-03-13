const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndex() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('bookings');

        console.log('Checking indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        const oldIndexName = 'date_1_timeSlot_1';
        const hasOldIndex = indexes.some(idx => idx.name === oldIndexName);

        if (hasOldIndex) {
            console.log(`Dropping old index: ${oldIndexName}...`);
            await collection.dropIndex(oldIndexName);
            console.log('Index dropped successfully.');
        } else {
            console.log(`Index ${oldIndexName} not found. Skipping drop.`);
        }

        console.log('Updating schema will handle new index creation via Mongoose.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error fixing index:', error);
        process.exit(1);
    }
}

fixIndex();
