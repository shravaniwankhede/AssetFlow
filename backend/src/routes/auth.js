import { Router } from 'express';
import crypto from 'crypto';
import prisma from '../prisma.js';
import { toFeUser } from '../utils/mappers.js';

const router = Router();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { department: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Please contact an Admin.' });
    }

    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const feUser = toFeUser(user);
    res.json({ success: true, user: feUser });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  try {
    const exists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hash = hashPassword(password);

    // Find default department Engineering or Operations or the first department
    let defaultDept = await prisma.department.findFirst({
      where: { name: 'Engineering' }
    });

    if (!defaultDept) {
      defaultDept = await prisma.department.findFirst();
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: hash,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        departmentId: defaultDept ? defaultDept.id : null
      }
    });

    res.json({ success: true, message: 'Account created successfully! Please sign in.' });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
