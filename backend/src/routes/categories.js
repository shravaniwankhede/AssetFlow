import { Router } from 'express';
import prisma from '../prisma.js';
import { toFeCategory } from '../utils/mappers.js';

const router = Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.assetCategory.findMany();
    const feCats = categories.map(toFeCategory);
    res.json(feCats);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  try {
    const exists = await prisma.assetCategory.findUnique({
      where: { name }
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }

    const newCat = await prisma.assetCategory.create({
      data: {
        name,
        description
      }
    });

    res.json({ success: true, category: toFeCategory(newCat) });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
