const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../models/userModel');

const registerUser = async (req, res) => {
  const { username, password } = req.body;
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { username, password: hashedPassword };
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully' });
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
  res.json({ token });
};

module.exports = { registerUser, loginUser };
