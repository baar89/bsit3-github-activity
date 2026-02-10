require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  const username = process.env.ADMIN_USERNAME || 'admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    username,
    email,
    passwordHash,
    role: 'admin',
    approved: true,
    banned: false,
    emailVerified: true
  });

  console.log('Admin seeded successfully');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
