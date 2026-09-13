import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { parseAttendanceImageServer, getSectionSchedule } from './src/server/geminiService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Direct schedule fetch endpoint by section and day
  app.post('/api/fetch-schedule', async (req, res) => {
    try {
      const { section, day, fullWeek = true } = req.body;
      const targetSection = (section || 'B9').toString().trim().toUpperCase();
      const result = getSectionSchedule(targetSection, day, fullWeek !== false);
      return res.json(result);
    } catch (error: any) {
      console.error('Server error in /api/fetch-schedule:', error);
      return res.status(500).json({ error: error?.message || 'Failed to fetch schedule' });
    }
  });

  app.get('/api/schedule/:section', async (req, res) => {
    try {
      const targetSection = (req.params.section || 'B9').toString().trim().toUpperCase();
      const day = typeof req.query.day === 'string' ? req.query.day : undefined;
      const fullWeek = req.query.fullWeek !== 'false';
      const result = getSectionSchedule(targetSection, day, fullWeek);
      return res.json(result);
    } catch (error: any) {
      console.error('Server error in /api/schedule/:section:', error);
      return res.status(500).json({ error: error?.message || 'Failed to fetch schedule' });
    }
  });

  app.get('/api/schedule', async (req, res) => {
    try {
      const targetSection = (req.query.section || 'B9').toString().trim().toUpperCase();
      const day = typeof req.query.day === 'string' ? req.query.day : undefined;
      const fullWeek = req.query.fullWeek !== 'false';
      const result = getSectionSchedule(targetSection, day, fullWeek);
      return res.json(result);
    } catch (error: any) {
      console.error('Server error in /api/schedule:', error);
      return res.status(500).json({ error: error?.message || 'Failed to fetch schedule' });
    }
  });

  // Server-side API endpoint for attendance image parsing via Gemini
  app.post('/api/parse-attendance', async (req, res) => {
    try {
      const { image, mimeType, section, day } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'Image data is required' });
      }
      const result = await parseAttendanceImageServer(image, mimeType, section, day);
      return res.json(result);
    } catch (error: any) {
      console.error('Server error in /api/parse-attendance:', error);
      return res.status(500).json({ error: error?.message || 'Failed to process attendance image' });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
