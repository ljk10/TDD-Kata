import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import progressRoutes from './routes/progress.routes';
import certificateRoutes from './routes/certificate.routes';
import adminRoutes from './routes/admin.routes';


const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',                  // Localhost
    'tdd-kata-three.vercel.app'       // <--- Your Exact Vercel URL
  ], 
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

export default app;