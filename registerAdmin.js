// registerAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const User = require('./models/user');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const register = async () => {
  console.log('--- Create Your Admin Account ---');
  
  // Connect to the database
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for registration...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }

  rl.question('Enter a username: ', (username) => {
    rl.question('Enter a password (min 8 chars): ', async (password) => {
      if (password.length < 8) {
        console.error('Password must be at least 8 characters long.');
        process.exit(0);
      }

      try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          console.error('Username already exists.');
          process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({ username, password: hashedPassword });
        console.log(`✅ Admin user '${username}' created successfully!`);
        
      } catch (error) {
        console.error('Error creating admin user:', error);
      } finally {
        mongoose.connection.close();
        process.exit(0);
      }
    });
  });
};

register();