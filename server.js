const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // Assuming User model is defined elsewhere

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://maxmudibragimov19771908:PjZDIr1LX1ZGDh6a@cluster0.ffsgcdb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));


  app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).send({ success: false, message: 'Username already exists' });
      }
      const user = new User({ username, password });
      await user.save();
      res.status(201).send({ success: true, message: 'User registered successfully' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).send({ success: false, message: 'Server error', error: error.message });
    }
  });
  
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      console.log('Received login request for username:', username);
      const user = await User.findOne({ username });
      console.log('User found:', user);
      if (user && user.password === password) {
        res.send({ success: true });
      } else {
        res.status(401).send({ success: false, message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send({ success: false, message: 'Login failed Server error', error: error.message });
    }
  });
  
// Define Item Schema and Model
const ItemSchema = new mongoose.Schema({
  name: String,
  amount: String,
  product: String,
});

const Item = mongoose.model('Item', ItemSchema);

// Existing routes...

app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).send({ success: true, items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send({ success: false, message: 'Server error', error: error.message });
  }
});

app.post('/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).send({ success: true, message: 'Item added successfully' });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).send({ success: false, message: 'Server error', error: error.message });
  }
});

// New delete endpoint
app.delete('/items/:_id', async (req, res) => {
  const { _id } = req.params;
  try {
    const deletedItem = await Item.findByIdAndDelete(_id);
    if (!deletedItem) {
      return res.status(404).send({ success: false, message: 'Item not found' });
    }
    res.status(200).send({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send({ success: false, message: 'Server error', error: error.message });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});