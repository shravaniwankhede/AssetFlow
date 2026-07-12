import { Router } from 'express';
import prisma from '../prisma.js';
import { toFeAudit } from '../utils/mappers.js';

const router = Router();

// GET /api/audits
router.get('/', async (req, res) => {
  try {
    const cycles = await prisma.auditCycle.findMany({
      include: {
        auditors: true,
        auditItems: {
          include: {
            asset: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    const feAudits = cycles.map(toFeAudit);
    res.json(feAudits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PATCH /api/audits/:id/items/:assetTag (Verify Audit Item)
router.patch('/:id/items/:assetTag', async (req, res) => {
  const { verificationStatus } = req.body;
  const auditId = req.params.id;
  const { assetTag } = req.params;

  if (!verificationStatus) {
    return res.status(400).json({ success: false, message: 'Verification status is required' });
  }

  try {
    const dbAuditId = parseInt(auditId.replace('aud-', ''));
    if (isNaN(dbAuditId)) {
      return res.status(400).json({ success: false, message: 'Invalid audit cycle ID' });
    }

    const asset = await prisma.asset.findUnique({
      where: { tag: assetTag }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Map status
    let dbStatus = 'PENDING';
    if (verificationStatus === 'Verified') dbStatus = 'VERIFIED';
    else if (verificationStatus === 'Missing') dbStatus = 'MISSING';
    else if (verificationStatus === 'Damaged') dbStatus = 'DAMAGED';

    // Find the item first to make sure it exists
    const auditItem = await prisma.auditItem.findFirst({
      where: {
        auditCycleId: dbAuditId,
        assetId: asset.id
      }
    });

    if (!auditItem) {
      return res.status(404).json({ success: false, message: 'Audit item not found in this cycle' });
    }

    await prisma.auditItem.update({
      where: { id: auditItem.id },
      data: { status: dbStatus }
    });

    // Fetch updated audit cycle to return
    const updatedCycle = await prisma.auditCycle.findUnique({
      where: { id: dbAuditId },
      include: {
        auditors: true,
        auditItems: {
          include: {
            asset: true
          }
        }
      }
    });

    res.json({ success: true, audit: toFeAudit(updatedCycle) });
  } catch (error) {
    console.error('Error updating audit item:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/audits/:id/close
router.post('/:id/close', async (req, res) => {
  const auditId = req.params.id;

  try {
    const dbId = parseInt(auditId.replace('aud-', ''));
    if (isNaN(dbId)) {
      return res.status(400).json({ success: false, message: 'Invalid audit cycle ID' });
    }

    const cycle = await prisma.auditCycle.findUnique({
      where: { id: dbId },
      include: {
        auditItems: {
          include: {
            asset: true
          }
        }
      }
    });

    if (!cycle) {
      return res.status(404).json({ success: false, message: 'Audit cycle not found' });
    }

    // Reconcile items
    for (const item of cycle.auditItems) {
      if (item.status === 'MISSING') {
        await prisma.asset.update({
          where: { id: item.assetId },
          data: { status: 'LOST' }
        });
      } else if (item.status === 'DAMAGED') {
        await prisma.asset.update({
          where: { id: item.assetId },
          data: { status: 'UNDER_MAINTENANCE' }
        });

        // Auto-create maintenance request
        await prisma.maintenanceRequest.create({
          data: {
            assetId: item.assetId,
            reporterId: item.auditorId,
            description: `Audit Damaged Flag: ${item.asset.name}`,
            notes: 'Flagged as damaged during audit verification.',
            priority: 'MEDIUM',
            status: 'PENDING'
          }
        });
      }
    }

    // Update cycle status to COMPLETED
    const updatedCycle = await prisma.auditCycle.update({
      where: { id: dbId },
      data: { status: 'COMPLETED' },
      include: {
        auditors: true,
        auditItems: {
          include: {
            asset: true
          }
        }
      }
    });

    res.json({ success: true, audit: toFeAudit(updatedCycle) });
  } catch (error) {
    console.error('Error closing audit:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
