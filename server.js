const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // Assuming User model is defined elsewhere
require('dotenv').config(); // Import and configure dotenv

const app = express();
app.use(cors());
app.use(express.json());

// Use the MONGO_URI environment variable
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Existing routes...

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
  name: { type: String, required: true },
  amount: { type: String, required: true },
  product: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  image: { type: String }
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
    const { name, amount, product, image, date, time } = req.body;

    // Check if item with the same name already exists
    const existingItem = await Item.findOne({ name });
    if (existingItem) {
      return res.status(400).send({ success: false, message: 'Item with this name already exists' });
    }

    // Create and save new item
    const newItem = new Item({ name, amount, product, image, date, time });
    await newItem.save();
    res.status(201).send({ success: true, message: 'Item added successfully' });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).send({ success: false, message: 'Server error', error: error.message });
  }
});

// New PUT endpoint for updating an item
app.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  
  try {
    // Find the item by ID and update it with the new data
    const updatedItem = await Item.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    if (!updatedItem) {
      return res.status(404).send({ success: false, message: 'Item not found' });
    }

    res.status(200).send({ success: true, message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send({ success: false, message: 'Server error', error: error.message });
  }
});

// New DELETE endpoint for deleting an item
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

// Use the PORT environment variable
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
