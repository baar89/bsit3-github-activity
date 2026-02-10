const validator = require('validator');

const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email and password are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!validator.isLength(password, { min: 8 })) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  next();
};

const validateAuction = (req, res, next) => {
  const { title, robloxItemName, description, startPrice, bidIncrement, endTime } = req.body;

  if (!title || !robloxItemName || !description || !startPrice || !bidIncrement || !endTime) {
    return res.status(400).json({ message: 'Missing required auction fields' });
  }

  if (Number(startPrice) < 0 || Number(bidIncrement) <= 0) {
    return res.status(400).json({ message: 'Prices must be valid positive numbers' });
  }

  if (new Date(endTime) <= new Date()) {
    return res.status(400).json({ message: 'Auction end time must be in the future' });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateAuction
};
