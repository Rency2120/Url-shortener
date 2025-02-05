import { createClient } from '@redis/client';

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
    connectTimeout: 10000, 
  },
});

redisClient.on("error", (err) => {
  console.log("Error connecting to Redis:", err);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
    return redisClient;
  } catch (err) {
    console.error("Error connecting to Redis:", err);
  }
};

export default redisClient;
