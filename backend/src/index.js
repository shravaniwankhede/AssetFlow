import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'AssetFlow API Server is running',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
