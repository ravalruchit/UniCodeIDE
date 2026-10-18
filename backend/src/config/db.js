import dns from 'node:dns';
import mongoose from 'mongoose';
import { ENV } from './env.js';

// Resolve MongoDB SRV lookups reliably across networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore if not supported in environment
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[Database] MongoDB connection warning: ${error.message}`);
    console.warn('[Database] Backend will operate with mock seed data fallback if database is offline.');
  }
};

export const getDBStatus = () => isConnected;
