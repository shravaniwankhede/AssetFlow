import { Router } from 'express';
import prisma from '../prisma.js';
import { toFeBooking } from '../utils/mappers.js';

const router = Router();

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await prisma.resourceBooking.findMany({
      include: {
        asset: true,
        user: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    const feBookings = bookings.map(toFeBooking);
    res.json(feBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/bookings (Create Booking with overlap checks)
router.post('/', async (req, res) => {
  const { resourceName, title, startTime, endTime, dateStr } = req.body;
  const userEmpId = req.headers['x-user-id'];

  if (!resourceName || !startTime || !endTime || !dateStr) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Parse times
    const startDateTime = new Date(`${dateStr}T${startTime}:00`);
    const endDateTime = new Date(`${dateStr}T${endTime}:00`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date/time' });
    }

    if (startDateTime >= endDateTime) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    // Resolve user ID
    let userId = 1; // Default fallback
    if (userEmpId) {
      const parsedId = parseInt(userEmpId.replace('emp-', ''));
      if (!isNaN(parsedId)) userId = parsedId;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Find or create asset (resource) dynamically
    let asset = await prisma.asset.findFirst({
      where: { name: resourceName }
    });

    if (!asset) {
      let category = await prisma.assetCategory.findFirst({
        where: { name: 'Shared Assets' }
      });
      if (!category) {
        category = await prisma.assetCategory.create({
          data: { name: 'Shared Assets', description: 'Shared office resources' }
        });
      }

      const allAssets = await prisma.asset.findMany({ select: { tag: true } });
      const activeNumbers = allAssets.map(a => {
        const match = a.tag.match(/AF-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
      const nextNumber = Math.max(...activeNumbers, 0) + 1;
      const tag = `AF-${nextNumber.toString().padStart(4, '0')}`;

      asset = await prisma.asset.create({
        data: {
          tag,
          name: resourceName,
          acquisitionDate: new Date(),
          acquisitionCost: 0,
          condition: 'GOOD',
          location: 'HQ Office',
          isShared: true,
          status: 'AVAILABLE',
          categoryId: category.id
        }
      });
    }

    // Check for booking overlap
    const overlap = await prisma.resourceBooking.findFirst({
      where: {
        assetId: asset.id,
        status: { not: 'CANCELLED' },
        startTime: { lt: endDateTime },
        endTime: { gt: startDateTime }
      }
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: `Booking overlaps with an existing schedule for ${resourceName}. Double bookings are blocked.`
      });
    }

    // Create booking
    const newBooking = await prisma.resourceBooking.create({
      data: {
        assetId: asset.id,
        userId,
        departmentId: user ? user.departmentId : null,
        title: title || 'Resource Booking',
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'UPCOMING'
      },
      include: {
        asset: true,
        user: true
      }
    });

    res.json({ success: true, booking: toFeBooking(newBooking) });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/bookings/:id/cancel
router.post('/:id/cancel', async (req, res) => {
  const bkId = req.params.id;

  try {
    const dbId = parseInt(bkId.replace('bk-', ''));
    if (isNaN(dbId)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const updatedBooking = await prisma.resourceBooking.update({
      where: { id: dbId },
      data: { status: 'CANCELLED' },
      include: {
        asset: true,
        user: true
      }
    });

    res.json({ success: true, booking: toFeBooking(updatedBooking) });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
