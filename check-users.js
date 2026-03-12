const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'username email');
        console.log('Existing Users:', users);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
