import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { handleApiRequest } from './src/api.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Forward any /api routes directly to our unified API handler
app.all('/api/*', async (req, res) => {
  try {
    await handleApiRequest(req, res);
  } catch (err) {
    console.error('API Routing error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve frontend static assets from dist/
const __dirname = path.resolve();
const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

// Fallback all SPA routing to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Production server is running on port ${PORT}`);
});
