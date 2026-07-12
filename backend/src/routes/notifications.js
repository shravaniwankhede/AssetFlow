import { Router } from 'express';
import prisma from '../prisma.js';
import { toFeNotification } from '../utils/mappers.js';

const router = Router();

// GET /api/notifications
router.get('/', async (req, res) => {
  const userEmpId = req.headers['x-user-id'];

  try {
    let userId = 1; // Fallback
    if (userEmpId) {
      const parsedId = parseInt(userEmpId.replace('emp-', ''));
      if (!isNaN(parsedId)) userId = parsedId;
    }

    let notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Auto-seed notifications for the user if they have none, ensuring the UI has rich, realistic content
    if (notifications.length === 0) {
      await prisma.notification.createMany({
        data: [
          { userId, title: 'Asset Assigned', message: 'Dell XPS 15 Laptop assigned to Priya Sharma', type: 'Asset Assigned', isRead: false, createdAt: new Date(Date.now() - 3 * 60000) },
          { userId, title: 'Maintenance Approved', message: 'Maintenance request for Dell Latitude approved', type: 'Maintenance Approved', isRead: false, createdAt: new Date(Date.now() - 15 * 60000) },
          { userId, title: 'Booking Confirmed', message: 'Booking confirmed: Tesla Model Y : 10:00 AM to 12:00 PM', type: 'Booking Confirmed', isRead: true, createdAt: new Date(Date.now() - 60 * 60000) },
          { userId, title: 'Overdue Return', message: 'Overdue return: Asset AF-0003 was due 3 days ago', type: 'Overdue Return', isRead: false, createdAt: new Date(Date.now() - 24 * 3600000) }
        ]
      });

      notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    }

    const feNotifications = notifications.map(toFeNotification);
    res.json(feNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/notifications
router.post('/', async (req, res) => {
  const { category, message } = req.body;
  const userEmpId = req.headers['x-user-id'];

  if (!category || !message) {
    return res.status(400).json({ success: false, message: 'Category and message are required' });
  }

  try {
    let userId = 1;
    if (userEmpId) {
      const parsedId = parseInt(userEmpId.replace('emp-', ''));
      if (!isNaN(parsedId)) userId = parsedId;
    }

    const newNotification = await prisma.notification.create({
      data: {
        userId,
        title: category,
        message,
        type: category,
        isRead: false
      }
    });

    res.json({ success: true, notification: toFeNotification(newNotification) });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/notifications/read-all (Mark all as read)
router.post('/read-all', async (req, res) => {
  const userEmpId = req.headers['x-user-id'];

  try {
    let userId = 1;
    if (userEmpId) {
      const parsedId = parseInt(userEmpId.replace('emp-', ''));
      if (!isNaN(parsedId)) userId = parsedId;
    }

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
