import express from "express";
import { googleAuth, googleCallback, logout } from "../controllers/authController.js";

const router = express.Router();

router.get('/google', googleAuth);

router.get('/google/callback',googleCallback);

router.post('/logout', logout)

export default router;
