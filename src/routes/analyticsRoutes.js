import express from "express";
import { getOverallAnalytics, getUrlAnalytics, getUrlAnalyticsByTopic } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/alias/:alias", getUrlAnalytics);
router.get("/topic/:topic", getUrlAnalyticsByTopic)
router.get("/overall", getOverallAnalytics);

export default router;
