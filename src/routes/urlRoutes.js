import express from "express";
import createShortUrlLimiter from "../middleware/limiter.js";
import { createShortUrl, redirectToOriginalUrl } from "../controllers/urlController.js";

const router = express.Router();

router.post('/shorten', createShortUrlLimiter,createShortUrl);

router.get("/:alias", redirectToOriginalUrl);

export default router;