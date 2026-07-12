import { Router } from 'express';
import prisma from '../prisma.js';
import { toFeMaintenance, toDbStatus } from '../utils/mappers.js';

const router = Router();

// GET /api/maintenance
router.get('/', async (req, res) => {
  try {
    const tickets = await prisma.maintenanceRequest.findMany({
      include: {
        asset: true,
        reporter: true,
        technician: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    const feTickets = tickets.map(toFeMaintenance);
    res.json(feTickets);
  } catch (error) {
    console.error('Error fetching maintenance tickets:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/maintenance (Report Maintenance)
router.post('/', async (req, res) => {
  const { assetId, title, notes } = req.body;
  const reporterEmpId = req.headers['x-user-id'];

  if (!assetId || !title) {
    return res.status(400).json({ success: false, message: 'Asset tag and title are required' });
  }

  try {
    // Resolve reporter
    let reporterId = 1; // Default
    if (reporterEmpId) {
      const parsedId = parseInt(reporterEmpId.replace('emp-', ''));
      if (!isNaN(parsedId)) reporterId = parsedId;
    }

    // Find asset
    const asset = await prisma.asset.findUnique({
      where: { tag: assetId }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: `Asset '${assetId}' not found.` });
    }

    // Create ticket
    const ticket = await prisma.maintenanceRequest.create({
      data: {
        assetId: asset.id,
        reporterId,
        description: title,
        notes: notes || '',
        priority: 'MEDIUM',
        status: 'PENDING'
      },
      include: {
        asset: true,
        reporter: true,
        technician: true
      }
    });

    // Automatically transition Asset Status to "UNDER_MAINTENANCE"
    await prisma.asset.update({
      where: { id: asset.id },
      data: { status: 'UNDER_MAINTENANCE' }
    });

    res.json({ success: true, ticket: toFeMaintenance(ticket) });
  } catch (error) {
    console.error('Error reporting maintenance:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PATCH /api/maintenance/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status, technician } = req.body;
  const maintId = req.params.id;

  try {
    const dbId = parseInt(maintId.replace('maint-', ''));
    if (isNaN(dbId)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID' });
    }

    const ticket = await prisma.maintenanceRequest.findUnique({
      where: { id: dbId }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Maintenance ticket not found' });
    }

    // Map frontend status to database status
    let dbStatus = 'PENDING';
    if (status === 'Pending') dbStatus = 'PENDING';
    else if (status === 'Approved') dbStatus = 'APPROVED';
    else if (status === 'Technician Assigned') dbStatus = 'APPROVED'; // Represent as approved/technician assigned
    else if (status === 'In Progress') dbStatus = 'IN_PROGRESS';
    else if (status === 'Resolved') dbStatus = 'RESOLVED';
    else dbStatus = toDbStatus(status) || 'PENDING';

    const updateData = { status: dbStatus };

    // Resolve technician user if provided
    if (technician) {
      const user = await prisma.user.findFirst({
        where: { name: technician }
      });
      if (user) {
        updateData.technicianId = user.id;
      }
    }

    const updatedTicket = await prisma.maintenanceRequest.update({
      where: { id: dbId },
      data: updateData,
      include: {
        asset: true,
        reporter: true,
        technician: true
      }
    });

    // If resolved, return asset status to "AVAILABLE"
    if (dbStatus === 'RESOLVED') {
      await prisma.asset.update({
        where: { id: ticket.assetId },
        data: { status: 'AVAILABLE' }
      });
    }

    res.json({ success: true, ticket: toFeMaintenance(updatedTicket) });
  } catch (error) {
    console.error('Error updating maintenance ticket status:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
