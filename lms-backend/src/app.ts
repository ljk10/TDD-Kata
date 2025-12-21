import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import chapterRoutes from './routes/chapter.routes';
import progressRoutes from './routes/progress.routes';
import certificateRoutes from './routes/certificate.routes';
import adminRoutes from './routes/admin.routes'; 

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.get('/health', (req, res) => { res.status(200).json({ status: 'OK' }); });
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes); 
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.url}` });
});

export default app;