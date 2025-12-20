import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import progressRoutes from './routes/progress.routes';
import adminRoutes from './routes/admin.routes';
// ... any other imports

dotenv.config();

const app = express();

// 1. GLOBAL CORS (Wildcard for debugging)
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Request Logger (See what is hitting the server)
app.use((req, res, next) => {
  console.log(`📡 Request received: ${req.method} ${req.url}`);
  next();
});

// 3. Body Parser
app.use(express.json());

// 4. Test Route (To verify server is alive)
app.get('/', (req, res) => {
  res.send('API is running! Try /api/auth/login');
});

// 5. API Routes (Make sure /api is here!)
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes); 
app.use('/api/admin', adminRoutes);

// 6. 404 Handler (Log when a route is missed)
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route not found: ${req.url}` });
});

const PORT = process.env.PORT || 5000;

// Only start server if not testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;