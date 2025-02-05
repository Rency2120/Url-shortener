import rateLimit from "express-rate-limit";

const createShortUrlLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many short URLs created. Please try again after a minute.",
});
export default createShortUrlLimiter;
