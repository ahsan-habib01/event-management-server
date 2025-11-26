const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (for demo - in production use real database)
let events = [
  {
    id: 1,
    title: 'Tech Conference 2024',
    shortDescription:
      'Join us for the biggest tech conference featuring industry leaders and innovators...',
    fullDescription:
      'Join us for the biggest tech conference of the year! This three-day event brings together industry leaders, innovators, and tech enthusiasts from around the world. Experience keynote speeches from top executives, hands-on workshops, and networking opportunities that will shape the future of technology.',
    date: '2024-12-15',
    time: '09:00',
    location: 'Moscone Center, San Francisco, CA',
    price: '$299',
    category: 'Technology',
    imageUrl: '🚀',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Music Festival Summer',
    shortDescription:
      'Experience three days of amazing music performances from top artists worldwide...',
    fullDescription:
      'Experience three unforgettable days of amazing music performances from top artists worldwide. This summer music festival features multiple stages with diverse genres including rock, pop, electronic, and indie music. Enjoy food trucks, art installations, and camping options.',
    date: '2025-01-20',
    time: '12:00',
    location: 'Zilker Park, Austin, TX',
    price: '$150',
    category: 'Music',
    imageUrl: '🎵',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Food & Wine Expo',
    shortDescription:
      'Taste exquisite dishes and wines from renowned chefs and sommeliers...',
    fullDescription:
      'Taste exquisite dishes and wines from renowned chefs and sommeliers from around the world. This culinary event features cooking demonstrations, wine tastings, and exclusive dining experiences that will delight your palate.',
    date: '2025-02-05',
    time: '10:00',
    location: 'Javits Center, New York, NY',
    price: '$75',
    category: 'Food',
    imageUrl: '🍷',
    createdAt: new Date().toISOString(),
  },
];

let nextId = 4;

// ============ ROUTES ============

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🎉 EventHub API Server',
    version: '1.0.0',
    endpoints: {
      events: '/api/events',
      health: '/health',
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    eventsCount: events.length,
  });
});

// Get all events
app.get('/api/events', (req, res) => {
  console.log('📋 Fetching all events...');
  res.json(events);
});

// Get single event by ID
app.get('/api/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const event = events.find(e => e.id === id);

  if (!event) {
    console.log(`❌ Event not found: ID ${id}`);
    return res.status(404).json({ error: 'Event not found' });
  }

  console.log(`✅ Found event: ${event.title}`);
  res.json(event);
});

// Create new event
app.post('/api/events', (req, res) => {
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
  } = req.body;

  // Validation
  if (
    !title ||
    !shortDescription ||
    !fullDescription ||
    !date ||
    !location ||
    !price
  ) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: [
        'title',
        'shortDescription',
        'fullDescription',
        'date',
        'location',
        'price',
      ],
    });
  }

  const newEvent = {
    id: nextId++,
    title,
    shortDescription,
    fullDescription,
    date,
    time: time || '09:00',
    location,
    price,
    category: category || 'Other',
    imageUrl: imageUrl || '📅',
    createdAt: new Date().toISOString(),
  };

  events.push(newEvent);
  console.log(`✅ Created new event: ${newEvent.title} (ID: ${newEvent.id})`);

  res.status(201).json(newEvent);
});

// Update event
app.put('/api/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const eventIndex = events.findIndex(e => e.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const updatedEvent = {
    ...events[eventIndex],
    ...req.body,
    id: events[eventIndex].id, // Preserve the original ID
    updatedAt: new Date().toISOString(),
  };

  events[eventIndex] = updatedEvent;
  console.log(`✅ Updated event: ${updatedEvent.title} (ID: ${id})`);

  res.json(updatedEvent);
});

// Delete event
app.delete('/api/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const eventIndex = events.findIndex(e => e.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const deletedEvent = events[eventIndex];
  events.splice(eventIndex, 1);
  console.log(`🗑️  Deleted event: ${deletedEvent.title} (ID: ${id})`);

  res.json({
    message: 'Event deleted successfully',
    deletedEvent,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('🚀 EventHub API Server is running!');
  console.log('═══════════════════════════════════════');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📋 Events API: http://localhost:${PORT}/api/events`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Current events in database: ${events.length}`);
  console.log('═══════════════════════════════════════');
});
