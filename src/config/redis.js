import redis from "redis";

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
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
