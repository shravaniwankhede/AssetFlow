import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Status endpoint
app.get('/api/status', async (req, res) => {
  let dbConnection = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnection = 'connected';
  } catch (error) {
    dbConnection = 'disconnected';
  }

  res.json({
    status: 'online',
    message: 'AssetFlow API Server is running',
    database: dbConnection,
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
