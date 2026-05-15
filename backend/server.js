import 'dotenv/config';
import http from 'http';
import app       from './app.js';
import connectDB from './config/db.js';
import batchJob  from './jobs/batchJob.js';
import { initializeSocket } from './utils/socket.js';

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();

  // Start cron job AFTER db is connected
  batchJob();

  // Create HTTP server and attach Socket.io
  const server = http.createServer(app);
  initializeSocket(server);

  server.listen(PORT, () => {
    console.log(`\n🚀 KiranaConnect API running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   MongoDB     : ${process.env.MONGO_URI}`);
    console.log(`   Redis       : ${process.env.REDIS_URL}\n`);
  });
};

start();
