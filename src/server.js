import app from "./app.js";
import connectToDb from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import "dotenv/config";

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectToDb();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
