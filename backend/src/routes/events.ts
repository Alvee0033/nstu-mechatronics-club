import { Router, Request, Response } from 'express';
import { getEvents, getEventById, addEvent, updateEvent, deleteEvent, Event, Timestamp } from '../firestore';

const router = Router();

// GET /api/events - Get all events
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await getEvents();
    // Convert Timestamp to ISO string for JSON response
    const formattedEvents = events.map(event => ({
      ...event,
      date: event.date?.toDate().toISOString().split('T')[0] || '',
      status: new Date(event.date?.toDate() || '') > new Date() ? 'upcoming' : 'past'
    }));
    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await getEventById(req.params.id);
    if (event) {
      const formattedEvent = {
        ...event,
        date: event.date?.toDate().toISOString().split('T')[0] || '',
        status: new Date(event.date?.toDate() || '') > new Date() ? 'upcoming' : 'past'
      };
      res.json(formattedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// POST /api/events - Create new event
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, date, location, image, category, organizer } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ message: 'Title, description, and date are required' });
    }

    const eventData: Omit<Event, 'id'> = {
      title,
      description,
      date: Timestamp.fromDate(new Date(date)), // Convert string to Timestamp
      location,
      image,
      category,
      organizer
    };

    const eventId = await addEvent(eventData);
    if (eventId) {
      res.status(201).json({ id: eventId, message: 'Event created successfully' });
    } else {
      res.status(500).json({ message: 'Error creating event' });
    }
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, description, date, location, image, category, organizer } = req.body;

    const updateData: Partial<Event> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = Timestamp.fromDate(new Date(date));
    if (location !== undefined) updateData.location = location;
    if (image !== undefined) updateData.image = image;
    if (category !== undefined) updateData.category = category;
    if (organizer !== undefined) updateData.organizer = organizer;

    await updateEvent(req.params.id, updateData);
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deleteEvent(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

export default router;
