import { Router } from 'express';
import prisma from '../prisma.js';
import { toFeAsset, toDbStatus } from '../utils/mappers.js';

const router = Router();

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        category: true,
        department: true,
        user: true,
        bookings: {
          include: { user: true }
        },
        maintenance: {
          include: { reporter: true }
        },
        transfers: {
          include: { requester: true }
        }
      }
    });

    const feAssets = assets.map(toFeAsset);
    res.json(feAssets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/assets (Register Asset)
router.post('/', async (req, res) => {
  const {
    name,
    category,
    status,
    location,
    assignedTo,
    department,
    serialNo,
    acquisitionDate,
    acquisitionCost,
    condition,
    isShared
  } = req.body;

  if (!name || !category) {
    return res.status(400).json({ success: false, message: 'Name and category are required' });
  }

  try {
    // 1. Auto generate Asset Tag (e.g. AF-XXXX)
    const allAssets = await prisma.asset.findMany({ select: { tag: true } });
    const activeNumbers = allAssets.map(a => {
      const match = a.tag.match(/AF-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const nextNumber = Math.max(...activeNumbers, 0) + 1;
    const tag = `AF-${nextNumber.toString().padStart(4, '0')}`;

    // 2. Resolve Category
    const cat = await prisma.assetCategory.findUnique({
      where: { name: category }
    });
    if (!cat) {
      return res.status(400).json({ success: false, message: `Category '${category}' does not exist.` });
    }

    // 3. Resolve Assigned User and Department
    let userId = null;
    let departmentId = null;

    if (assignedTo) {
      const user = await prisma.user.findFirst({
        where: { name: assignedTo }
      });
      if (user) {
        userId = user.id;
        departmentId = user.departmentId; // Auto-align with user's department
      }
    }

    if (!departmentId && department) {
      const dept = await prisma.department.findFirst({
        where: { name: department }
      });
      if (dept) {
        departmentId = dept.id;
      }
    }

    // Determine database status
    let dbStatus = 'AVAILABLE';
    if (userId) {
      dbStatus = 'ALLOCATED';
    } else if (status) {
      dbStatus = toDbStatus(status);
    }

    const newAsset = await prisma.asset.create({
      data: {
        tag,
        name,
        serialNo: serialNo || null,
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : new Date(),
        acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : 0,
        condition: condition ? condition.toUpperCase() : 'EXCELLENT',
        location: location || 'Warehouse',
        isShared: isShared === true,
        status: dbStatus,
        categoryId: cat.id,
        departmentId,
        userId
      },
      include: {
        category: true,
        department: true,
        user: true,
        bookings: {
          include: { user: true }
        },
        maintenance: {
          include: { reporter: true }
        },
        transfers: {
          include: { requester: true }
        }
      }
    });

    res.json({ success: true, asset: toFeAsset(newAsset) });
  } catch (error) {
    console.error('Error registering asset:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PATCH /api/assets/:tag/status (Update status/location)
router.patch('/:tag/status', async (req, res) => {
  const { status, location, condition, notes } = req.body;
  const { tag } = req.params;

  try {
    const asset = await prisma.asset.findUnique({
      where: { tag }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const updateData = {};
    if (status) updateData.status = toDbStatus(status);
    if (location) updateData.location = location;
    if (condition) updateData.condition = condition.toUpperCase();

    const updatedAsset = await prisma.asset.update({
      where: { tag },
      data: updateData,
      include: {
        category: true,
        department: true,
        user: true,
        bookings: {
          include: { user: true }
        },
        maintenance: {
          include: { reporter: true }
        },
        transfers: {
          include: { requester: true }
        }
      }
    });

    res.json({ success: true, asset: toFeAsset(updatedAsset) });
  } catch (error) {
    console.error('Error updating asset status:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/assets/:tag/allocate (Assign Asset)
router.post('/:tag/allocate', async (req, res) => {
  const { employeeName, notes } = req.body;
  const { tag } = req.params;

  try {
    const asset = await prisma.asset.findUnique({
      where: { tag },
      include: { user: true }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (asset.status === 'ALLOCATED' && asset.user) {
      return res.status(400).json({
        success: false,
        message: `This asset is already allocated to ${asset.user.name}.`,
        isAllocated: true,
        currentHolder: asset.user.name
      });
    }

    const user = await prisma.user.findFirst({
      where: { name: employeeName }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: `Employee '${employeeName}' not found.` });
    }

    const updatedAsset = await prisma.asset.update({
      where: { tag },
      data: {
        status: 'ALLOCATED',
        userId: user.id,
        departmentId: user.departmentId
      },
      include: {
        category: true,
        department: true,
        user: true,
        bookings: {
          include: { user: true }
        },
        maintenance: {
          include: { reporter: true }
        },
        transfers: {
          include: { requester: true }
        }
      }
    });

    res.json({ success: true, asset: toFeAsset(updatedAsset) });
  } catch (error) {
    console.error('Error allocating asset:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/assets/:tag/deallocate (Return Asset)
router.post('/:tag/deallocate', async (req, res) => {
  const { conditionNotes } = req.body;
  const { tag } = req.params;

  try {
    const asset = await prisma.asset.findUnique({
      where: { tag }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const updatedAsset = await prisma.asset.update({
      where: { tag },
      data: {
        status: 'AVAILABLE',
        userId: null,
        departmentId: null
      },
      include: {
        category: true,
        department: true,
        user: true,
        bookings: {
          include: { user: true }
        },
        maintenance: {
          include: { reporter: true }
        },
        transfers: {
          include: { requester: true }
        }
      }
    });

    res.json({ success: true, asset: toFeAsset(updatedAsset) });
  } catch (error) {
    console.error('Error deallocating asset:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
