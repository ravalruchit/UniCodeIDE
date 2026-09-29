import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  // Attempt DB connection
  await connectDB();

  const server = app.listen(ENV.PORT, () => {
    console.log(`[Server] UniCodeIDE API running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
    console.log(`[Server] Health check: http://localhost:${ENV.PORT}/api/health`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('[Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Server] Closed remaining active connections.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
