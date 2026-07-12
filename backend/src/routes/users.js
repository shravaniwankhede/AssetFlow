import { Router } from 'express';
import crypto from 'crypto';
import prisma from '../prisma.js';
import { toFeUser, toDbRole, toDbStatus } from '../utils/mappers.js';

const router = Router();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { department: true }
    });
    const feUsers = users.map(toFeUser);
    res.json(feUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/users (Add Employee)
router.post('/', async (req, res) => {
  const { name, email, role, department } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  try {
    const exists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Resolve department
    let deptId = null;
    if (department) {
      const dept = await prisma.department.findFirst({
        where: { name: department }
      });
      if (dept) deptId = dept.id;
    }

    const hash = hashPassword('password123'); // Default password for new employees
    const dbRole = toDbRole(role);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: hash,
        role: dbRole,
        status: 'ACTIVE',
        departmentId: deptId
      }
    });

    res.json({ success: true, user: toFeUser(newUser) });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PATCH /api/users/:id/role
router.patch('/:id/role', async (req, res) => {
  const { role } = req.body;
  const empId = req.params.id;

  try {
    const dbId = parseInt(empId.replace('emp-', ''));
    if (isNaN(dbId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID' });
    }

    const dbRole = toDbRole(role);
    const updatedUser = await prisma.user.update({
      where: { id: dbId },
      data: { role: dbRole }
    });

    res.json({ success: true, user: toFeUser(updatedUser) });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PATCH /api/users/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const empId = req.params.id;

  try {
    const dbId = parseInt(empId.replace('emp-', ''));
    if (isNaN(dbId)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID' });
    }

    const dbStatus = toDbStatus(status);
    const updatedUser = await prisma.user.update({
      where: { id: dbId },
      data: { status: dbStatus }
    });

    res.json({ success: true, user: toFeUser(updatedUser) });
  } catch (error) {
    console.error('Error deactivating/activating user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
