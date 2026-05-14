import 'dotenv/config';
import app       from './app.js';
import connectDB from './config/db.js';
import batchJob  from './jobs/batchJob.js';

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();

  // Start cron job AFTER db is connected
  batchJob();

  app.listen(PORT, () => {
    console.log(`\n🚀 KiranaConnect API running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   MongoDB     : ${process.env.MONGO_URI}`);
    console.log(`   Redis       : ${process.env.REDIS_URL}\n`);
  });
};

start();
