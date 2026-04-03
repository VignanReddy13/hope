import express from 'express';
import { triggerEvent, getDailyStats, getAllEvents } from '../controllers/eventController.js';

const router = express.Router();

router.post('/trigger-event', triggerEvent);
router.get('/daily-stats', getDailyStats);
router.get('/events', getAllEvents);

export default router;
