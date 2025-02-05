import redis from "redis";

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
    connectTimeout: 10000, // Increase timeout if needed
  },
});

redisClient.on("error", (err) => {
  console.log("Error connecting to Redis:", err);
});

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("Redis connected successfully");
  return redisClient;
};

export default redisClient;
