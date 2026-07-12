import { Router } from 'express';
import prisma from '../prisma.js';
import { toFeTransfer } from '../utils/mappers.js';

const router = Router();

// GET /api/transfers
router.get('/', async (req, res) => {
  try {
    const transfers = await prisma.transferRequest.findMany({
      include: {
        asset: true,
        requester: true,
        currentHolder: true,
        targetUser: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    const feTransfers = transfers.map(toFeTransfer);
    res.json(feTransfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/transfers (Create Transfer Request)
router.post('/', async (req, res) => {
  const { assetId, toEmployee, reason } = req.body;
  const requesterEmpId = req.headers['x-user-id'];

  if (!assetId || !toEmployee) {
    return res.status(400).json({ success: false, message: 'Asset tag and target employee are required' });
  }

  try {
    // Resolve requester ID
    let requesterId = 1; // Default fallback
    if (requesterEmpId) {
      const parsedId = parseInt(requesterEmpId.replace('emp-', ''));
      if (!isNaN(parsedId)) requesterId = parsedId;
    }

    // Find asset
    const asset = await prisma.asset.findUnique({
      where: { tag: assetId }
    });
    if (!asset) {
      return res.status(404).json({ success: false, message: `Asset '${assetId}' not found.` });
    }

    // Find target employee
    const targetUser = await prisma.user.findFirst({
      where: { name: toEmployee }
    });
    if (!targetUser) {
      return res.status(400).json({ success: false, message: `Target employee '${toEmployee}' not found.` });
    }

    const newRequest = await prisma.transferRequest.create({
      data: {
        assetId: asset.id,
        requesterId,
        currentHolderId: asset.userId, // Can be null if available
        targetUserId: targetUser.id,
        targetDepartmentId: targetUser.departmentId,
        reason: reason || '',
        status: 'PENDING'
      },
      include: {
        asset: true,
        requester: true,
        currentHolder: true,
        targetUser: true
      }
    });

    res.json({ success: true, transfer: toFeTransfer(newRequest) });
  } catch (error) {
    console.error('Error creating transfer request:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/transfers/:id/approve
router.post('/:id/approve', async (req, res) => {
  const trId = req.params.id;

  try {
    const dbId = parseInt(trId.replace('tr-', ''));
    if (isNaN(dbId)) {
      return res.status(400).json({ success: false, message: 'Invalid transfer request ID' });
    }

    const request = await prisma.transferRequest.findUnique({
      where: { id: dbId },
      include: { targetUser: true }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Transfer request is already ${request.status.toLowerCase()}.` });
    }

    // Update asset owner
    await prisma.asset.update({
      where: { id: request.assetId },
      data: {
        userId: request.targetUserId,
        departmentId: request.targetDepartmentId,
        status: 'ALLOCATED'
      }
    });

    // Update request ticket
    const updatedRequest = await prisma.transferRequest.update({
      where: { id: dbId },
      data: { status: 'APPROVED' },
      include: {
        asset: true,
        requester: true,
        currentHolder: true,
        targetUser: true
      }
    });

    res.json({ success: true, transfer: toFeTransfer(updatedRequest) });
  } catch (error) {
    console.error('Error approving transfer:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/transfers/:id/reject
router.post('/:id/reject', async (req, res) => {
  const trId = req.params.id;

  try {
    const dbId = parseInt(trId.replace('tr-', ''));
    if (isNaN(dbId)) {
      return res.status(400).json({ success: false, message: 'Invalid transfer request ID' });
    }

    const request = await prisma.transferRequest.findUnique({
      where: { id: dbId }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Transfer request is already ${request.status.toLowerCase()}.` });
    }

    const updatedRequest = await prisma.transferRequest.update({
      where: { id: dbId },
      data: { status: 'REJECTED' },
      include: {
        asset: true,
        requester: true,
        currentHolder: true,
        targetUser: true
      }
    });

    res.json({ success: true, transfer: toFeTransfer(updatedRequest) });
  } catch (error) {
    console.error('Error rejecting transfer:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
