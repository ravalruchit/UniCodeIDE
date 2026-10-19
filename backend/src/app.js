import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Secure CORS configuration
// Secure CORS configuration with production domain validation
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, server-to-server, health probes)
      if (!origin) return callback(null, true);

      if (ENV.NODE_ENV === 'production') {
        const isAllowed =
          origin === ENV.CLIENT_URL ||
          origin.endsWith('.vercel.app') ||
          origin.endsWith('.onrender.com') ||
          origin.endsWith('.railway.app') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1');

        if (isAllowed) {
          return callback(null, true);
        }
        return callback(new Error(`CORS origin '${origin}' blocked by security policy.`));
      }

      // Permissive in development
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
