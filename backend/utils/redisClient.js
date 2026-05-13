import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

let connected = false;

client.on('error', (err) => {
  if (connected) console.warn('[Redis] Error:', err.message);
});

client.connect()
  .then(() => { connected = true; console.log('✅ Redis connected (cache active)'); })
  .catch(() => console.warn('⚠️  Redis unavailable — cache disabled, using DB directly'));

// Safe wrappers — if Redis is down, these are no-ops / return null
export const redisGet = async (key) => {
  if (!connected) return null;
  try { return await client.get(key); } catch { return null; }
};

export const redisSetEx = async (key, ttlSeconds, value) => {
  if (!connected) return;
  try { await client.setEx(key, ttlSeconds, value); } catch {}
};

export const redisDel = async (...keys) => {
  if (!connected) return;
  try { await client.del(keys); } catch {}
};

export default client;
