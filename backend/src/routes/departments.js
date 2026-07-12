import { Router } from 'express';
import prisma from '../prisma.js';
import { toFeDepartment, toDbStatus } from '../utils/mappers.js';

const router = Router();

// GET /api/departments
router.get('/', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        head: true,
        parentDepartment: true
      }
    });
    const feDepts = departments.map(toFeDepartment);
    res.json(feDepts);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/departments
router.post('/', async (req, res) => {
  const { name, head, parentDept } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Department name is required' });
  }

  try {
    // Generate code from name (e.g. Engineering -> ENG, Operations -> OPS)
    let code = name.slice(0, 3).toUpperCase();
    
    // Check if code exists, append random digit if it does
    let count = 0;
    while (await prisma.department.findUnique({ where: { code } })) {
      count++;
      code = name.slice(0, 3).toUpperCase() + count;
    }

    // Resolve head user ID
    let headId = null;
    if (head && head !== '-') {
      const user = await prisma.user.findFirst({
        where: { name: head }
      });
      if (user) headId = user.id;
    }

    // Resolve parent department ID
    let parentDeptId = null;
    if (parentDept && parentDept !== '-') {
      const parent = await prisma.department.findFirst({
        where: { name: parentDept }
      });
      if (parent) parentDeptId = parent.id;
    }

    const newDept = await prisma.department.create({
      data: {
        name,
        code,
        status: 'ACTIVE',
        headId,
        parentDepartmentId: parentDeptId
      },
      include: {
        head: true,
        parentDepartment: true
      }
    });

    res.json({ success: true, department: toFeDepartment(newDept) });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PATCH /api/departments/:id
router.patch('/:id', async (req, res) => {
  const { name, head, parentDept } = req.body;
  const deptId = req.params.id;

  try {
    const dbId = parseInt(deptId.replace('dept-', ''));
    if (isNaN(dbId)) {
      return res.status(400).json({ success: false, message: 'Invalid department ID' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;

    if (head !== undefined) {
      if (head === '-' || !head) {
        updateData.headId = null;
      } else {
        const user = await prisma.user.findFirst({
          where: { name: head }
        });
        if (user) updateData.headId = user.id;
      }
    }

    if (parentDept !== undefined) {
      if (parentDept === '-' || !parentDept) {
        updateData.parentDepartmentId = null;
      } else {
        const parent = await prisma.department.findFirst({
          where: { name: parentDept }
        });
        if (parent) updateData.parentDepartmentId = parent.id;
      }
    }

    const updatedDept = await prisma.department.update({
      where: { id: dbId },
      data: updateData,
      include: {
        head: true,
        parentDepartment: true
      }
    });

    res.json({ success: true, department: toFeDepartment(updatedDept) });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// PATCH /api/departments/:id/status (Toggle Status)
router.patch('/:id/status', async (req, res) => {
  const deptId = req.params.id;

  try {
    const dbId = parseInt(deptId.replace('dept-', ''));
    if (isNaN(dbId)) {
      return res.status(400).json({ success: false, message: 'Invalid department ID' });
    }

    const dept = await prisma.department.findUnique({ where: { id: dbId } });
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const newStatus = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const updatedDept = await prisma.department.update({
      where: { id: dbId },
      data: { status: newStatus },
      include: {
        head: true,
        parentDepartment: true
      }
    });

    res.json({ success: true, department: toFeDepartment(updatedDept) });
  } catch (error) {
    console.error('Error toggling department status:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
