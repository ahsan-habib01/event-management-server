const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, default: '09:00' },
  location: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, default: 'Other' },
  imageUrl: { type: String, default: '📅' },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model('Event', eventSchema);

// ============ ROUTES ============

// Root
app.get('/', (req, res) => {
  res.json({
    message: '🎉 EventHub API',
    status: 'Running',
    database:
      mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database:
      mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Get ALL events (public)
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    console.log(`📋 Fetched ${events.length} events`);
    res.json(events);
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    console.log(`✅ Found event: ${event.title}`);
    res.json(event);
  } catch (error) {
    console.error('❌ Error fetching event:', error);
    res.status(404).json({ error: 'Event not found' });
  }
});

// Get events by user
app.get('/api/events/user/:email', async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.params.email }).sort({
      createdAt: -1,
    });
    console.log(`📋 Found ${events.length} events for ${req.params.email}`);
    res.json(events);
  } catch (error) {
    console.error('❌ Error fetching user events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create event
app.post('/api/events', async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      fullDescription,
      date,
      time,
      location,
      price,
      category,
      imageUrl,
      createdBy,
    } = req.body;

    if (
      !title ||
      !shortDescription ||
      !fullDescription ||
      !date ||
      !location ||
      !price ||
      !createdBy
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const event = new Event({
      title,
      shortDescription,
      fullDescription,
      date,
      time: time || '09:00',
      location,
      price,
      category: category || 'Other',
      imageUrl: imageUrl || '📅',
      createdBy,
    });

    await event.save();
    console.log(`✅ Created event: ${event.title} by ${createdBy}`);
    res.status(201).json(event);
  } catch (error) {
    console.error('❌ Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    console.log(`🗑️ Deleted event: ${event.title}`);
    res.json({ message: 'Event deleted', event });
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('🚀 Server Running');
    console.log(`📍 http://localhost:${PORT}`);
  });
}

module.exports = app;
