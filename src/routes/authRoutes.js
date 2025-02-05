import express from "express";
import {
  googleAuth,
  googleCallback,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/google:
 *   get:
 *     summary: Google OAuth authentication
 *     operationId: googleAuth
 *     responses:
 *       302:
 *         description: Redirect to Google login
 */
router.get("/google", googleAuth);

/**
 * @openapi
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     operationId: googleCallback
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.get("/google/callback", googleCallback);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the currently authenticated user.
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.post("/logout", logout);

export default router;
