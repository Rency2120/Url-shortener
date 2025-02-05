import express from "express";
import {
  getOverallAnalytics,
  getUrlAnalytics,
  getUrlAnalyticsByTopic,
} from "../controllers/analyticsController.js";

const router = express.Router();

/**
 * @openapi
 * /api/analytics/alias/{alias}:
 *   get:
 *     summary: Get analytics for a specific short URL
 *     description: Retrieves click statistics, unique visitors, and usage patterns for a given short URL alias.
 *     parameters:
 *       - name: alias
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "abc123"
 *     responses:
 *       200:
 *         description: Successful response with analytics data
 *       404:
 *         description: Short URL not found
 *       500:
 *         description: Server error
 */
router.get("/alias/:alias", getUrlAnalytics);

/**
 * @openapi
 * /api/analytics/topic/{topic}:
 *   get:
 *     summary: Get analytics for URLs under a specific topic
 *     description: Fetches analytics data for all URLs associated with a given topic.
 *     parameters:
 *       - name: topic
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "tech-news"
 *     responses:
 *       200:
 *         description: Successful response with analytics data
 *       404:
 *         description: No URLs found for this topic
 *       500:
 *         description: Server error
 */
router.get("/topic/:topic", getUrlAnalyticsByTopic);

/**
 * @openapi
 * /api/analytics/overall:
 *   get:
 *     summary: Get overall analytics for the authenticated user
 *     description: Retrieves aggregated analytics data for all URLs created by the authenticated user.
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Successful response with overall analytics data
 *       404:
 *         description: No URLs found for this user
 *       500:
 *         description: Server error
 */
router.get("/overall", getOverallAnalytics);

export default router;
