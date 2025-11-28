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
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    await seedInitialData();
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err);
    process.exit(1);
  });

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

// Seed 6 initial events (only if database is empty)
async function seedInitialData() {
  try {
    const count = await Event.countDocuments();

    if (count === 0) {
      console.log('📦 Seeding initial 6 events...');

      const initialEvents = [
        {
          title: 'Tech Conference 2024',
          shortDescription:
            'Join us for the biggest tech conference featuring industry leaders and innovators',
          fullDescription:
            'Join us for the biggest tech conference of the year! This three-day event brings together industry leaders, innovators, and tech enthusiasts from around the world. Experience keynote speeches, workshops, and networking opportunities.',
          date: '2024-12-15',
          time: '09:00',
          location: 'Moscone Center, San Francisco, CA',
          price: '$299',
          category: 'Technology',
          imageUrl: '🚀',
          createdBy: 'demo@example.com',
        },
        {
          title: 'Music Festival Summer',
          shortDescription:
            'Experience three days of amazing music performances from top artists worldwide',
          fullDescription:
            'Experience three unforgettable days of amazing music performances from top artists worldwide. This summer music festival features multiple stages with diverse genres including rock, pop, electronic, and indie music.',
          date: '2025-01-20',
          time: '12:00',
          location: 'Zilker Park, Austin, TX',
          price: '$150',
          category: 'Music',
          imageUrl: '🎵',
          createdBy: 'demo@example.com',
        },
        {
          title: 'Food & Wine Expo',
          shortDescription:
            'Taste exquisite dishes and wines from renowned chefs and sommeliers',
          fullDescription:
            'Taste exquisite dishes and wines from renowned chefs and sommeliers from around the world. This culinary event features cooking demonstrations, wine tastings, and exclusive dining experiences.',
          date: '2025-02-05',
          time: '10:00',
          location: 'Javits Center, New York, NY',
          price: '$75',
          category: 'Food',
          imageUrl: '🍷',
          createdBy: 'demo@example.com',
        },
        {
          title: 'Startup Pitch Day',
          shortDescription:
            'Watch innovative startups pitch their ideas to top venture capitalists',
          fullDescription:
            'Watch innovative startups pitch their groundbreaking ideas to top venture capitalists and angel investors. Network with entrepreneurs, investors, and industry experts.',
          date: '2025-03-10',
          time: '09:00',
          location: 'Innovation Hub, Seattle, WA',
          price: 'Free',
          category: 'Business',
          imageUrl: '💼',
          createdBy: 'demo@example.com',
        },
        {
          title: 'Art Gallery Opening',
          shortDescription:
            'Explore contemporary art from emerging and established artists',
          fullDescription:
            'Explore contemporary art from emerging and established artists at this exclusive gallery opening. Meet the artists, enjoy wine and refreshments, and purchase unique pieces.',
          date: '2025-04-12',
          time: '18:00',
          location: 'Modern Art Museum, Los Angeles, CA',
          price: '$25',
          category: 'Art',
          imageUrl: '🎨',
          createdBy: 'demo@example.com',
        },
        {
          title: 'Marathon Challenge',
          shortDescription:
            'Run for a cause in our annual charity marathon supporting local communities',
          fullDescription:
            'Run for a cause in our annual charity marathon supporting local communities. Choose from 5K, 10K, half marathon, or full marathon distances. All proceeds go to local charities.',
          date: '2025-05-01',
          time: '06:00',
          location: 'City Center, Boston, MA',
          price: '$50',
          category: 'Sports',
          imageUrl: '🏃',
          createdBy: 'demo@example.com',
        },
      ];

      await Event.insertMany(initialEvents);
      console.log('✅ Seeded 6 initial events');
    } else {
      console.log(`📊 Database has ${count} events already`);
    }
  } catch (error) {
    console.error('❌ Seed error:', error);
  }
}

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
app.get('/health', async (req, res) => {
  const count = await Event.countDocuments();
  res.json({
    status: 'OK',
    database:
      mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    totalEvents: count,
    timestamp: new Date().toISOString(),
  });
});

// Get ALL events (public - everyone sees all)
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    console.log(`📋 GET /api/events - Returning ${events.length} events`);
    res.json(events);
  } catch (error) {
    console.error('❌ GET /api/events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      console.log(`❌ Event not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log(`✅ GET /api/events/${req.params.id} - Found: ${event.title}`);
    res.json(event);
  } catch (error) {
    console.error(`❌ GET /api/events/${req.params.id} error:`, error);
    res.status(404).json({ error: 'Event not found' });
  }
});

// Get events by user email (for manage page)
app.get('/api/events/user/:email', async (req, res) => {
  try {
    const userEmail = decodeURIComponent(req.params.email);
    const events = await Event.find({ createdBy: userEmail }).sort({
      createdAt: -1,
    });

    console.log(
      `📋 GET /api/events/user/${userEmail} - Found ${events.length} events`
    );
    res.json(events);
  } catch (error) {
    console.error('❌ GET /api/events/user error:', error);
    res.status(500).json({ error: 'Failed to fetch user events' });
  }
});

// Create new event
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

    console.log('📥 POST /api/events - Received data:', { title, createdBy });

    if (
      !title ||
      !shortDescription ||
      !fullDescription ||
      !date ||
      !location ||
      !price ||
      !createdBy
    ) {
      console.log('❌ Missing required fields');
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

    const savedEvent = await event.save();
    console.log(
      `✅ Event created: ${savedEvent.title} (ID: ${savedEvent._id}) by ${createdBy}`
    );

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('❌ POST /api/events error:', error);
    res
      .status(500)
      .json({ error: 'Failed to create event', details: error.message });
  }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      console.log(`❌ Event not found for delete: ${req.params.id}`);
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log(`🗑️ Event deleted: ${event.title} (ID: ${event._id})`);
    res.json({ message: 'Event deleted successfully', event });
  } catch (error) {
    console.error('❌ DELETE /api/events error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('🚀 EventHub API Server');
    console.log(`📍 http://localhost:${PORT}`);
  });
}

module.exports = app;
