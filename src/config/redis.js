import redis from "redis";

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379
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
