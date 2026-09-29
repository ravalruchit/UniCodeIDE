import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Secure CORS configuration
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logger in development
if (ENV.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'UniCodeIDE Enterprise API Gateway is running',
    docs: '/api/health',
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
