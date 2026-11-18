// Creates (or resets the password of) an admin account in the database from MONGO_URI.
// Useful for the first login or if you're locked out.
//
//   node scripts/create-admin.mjs <username> <email> <password>
//
// Reads MONGO_URI from the environment or from .env.

import { existsSync } from 'node:fs';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

if (!process.env.MONGO_URI && existsSync('.env')) process.loadEnvFile('.env');

const [username, email, password] = process.argv.slice(2);
if (!username || !email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <username> <email> <password>');
  process.exit(1);
}
if (password.length < 8) {
  console.error('The password must be at least 8 characters.');
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI, { autoIndex: false });
const users = mongoose.connection.db.collection('users');
const hash = await bcrypt.hash(password, 10);
const existing = await users.findOne({ $or: [{ username }, { email }] });
if (existing) {
  await users.updateOne({ _id: existing._id }, { $set: { username, email, password: hash } });
  console.log(`Updated admin "${username}".`);
} else {
  await users.insertOne({ username, email, password: hash });
  console.log(`Created admin "${username}".`);
}
await mongoose.disconnect();
