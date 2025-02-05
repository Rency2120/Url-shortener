import express from "express";
import createShortUrlLimiter from "../middleware/limiter.js";
import {
  createShortUrl,
  redirectToOriginalUrl,
} from "../controllers/urlController.js";

const router = express.Router();

/**
 * @openapi
 * /api/url/shorten:
 *   post:
 *     summary: Shorten a URL
 *     description: Takes a long URL and returns a shortened version.
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longUrl:
 *                 type: string
 *                 example: "https://example.com"
 *               customAlias:
 *                 type: string
 *                 example: "myalias"
 *               topic:
 *                 type: string
 *                 example: "Tech"
 *     responses:
 *       200:
 *         description: Successfully shortened the URL
 *       400:
 *         description: Invalid input
 */
router.post("/shorten", createShortUrlLimiter, createShortUrl);

/**
 * @openapi
 * /api/url/{alias}:
 *   get:
 *     summary: Redirect to the original URL
 *     description: Retrieves the long URL from the alias and redirects the user.
 *     parameters:
 *       - name: alias
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved long URL
 *       404:
 *         description: Short URL not found
 */
router.get("/:alias", redirectToOriginalUrl);

export default router;
