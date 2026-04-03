import fs from 'fs';
import path from 'path';

// Define the database file path
const DB_FILE = path.join(process.cwd(), 'database.json');

// Helper to get events from the JSON file
const getEventsData = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([]));
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return [];
  }
};

// Helper to save events
const saveEventsData = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

export const triggerEvent = async (req, res) => {
  try {
    const { eventType, timestamp, date, location, confidenceScore, imagePath } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: 'eventType is required' });
    }

    const newEvent = {
      _id: Date.now().toString(),
      eventType,
      timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
      date: date || new Date().toISOString().split('T')[0],
      location,
      confidenceScore,
      imagePath
    };

    const events = getEventsData();
    events.push(newEvent);
    saveEventsData(events);

    console.log('[DB] Event saved successfully:', newEvent._id);

    return res.status(201).json({
      success: true,
      message: 'Event triggered and stored successfully',
      data: newEvent
    });

  } catch (error) {
    console.error('[DB] Error saving event:', error);
    return res.status(500).json({ success: false, error: 'Failed to process event' });
  }
};

export const getDailyStats = async (req, res) => {
  try {
    const events = getEventsData();
    const statsMap = {};

    events.forEach(event => {
      statsMap[event.date] = (statsMap[event.date] || 0) + 1;
    });

    const stats = Object.keys(statsMap).map(date => ({
      date,
      count: statsMap[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json(stats);
  } catch (error) {
    console.error('[DB] Error fetching daily stats:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch daily stats' });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = getEventsData();
    // Sort latest first
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return res.status(200).json(events);
  } catch (error) {
    console.error('[DB] Error fetching events:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
};
