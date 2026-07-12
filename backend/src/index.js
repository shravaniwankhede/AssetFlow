import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma.js';

// Route imports
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import deptsRouter from './routes/departments.js';
import categoriesRouter from './routes/categories.js';
import assetsRouter from './routes/assets.js';
import bookingsRouter from './routes/bookings.js';
import maintenanceRouter from './routes/maintenance.js';
import auditsRouter from './routes/audits.js';
import notificationsRouter from './routes/notifications.js';
import transfersRouter from './routes/transfers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/departments', deptsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/transfers', transfersRouter);

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
