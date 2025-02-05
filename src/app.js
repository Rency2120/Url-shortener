import express from "express";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"; 
import  "./config/passport.js"; 
import urlRoutes from "./routes/urlRoutes.js";
import analyticRoutes from "./routes/analyticsRoutes.js";
import setUpSwagger from "../swaggerConfig.js";

dotenv.config();

const app = express();

app.use(express.json());

setUpSwagger(app);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key", 
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);
app.use("/api/analytics", analyticRoutes)

app.get("/api/protected", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.status(200).json({ message: "Protected route", user: req.user });
});

app.get("/", (req, res) => {
  res.send("Welcome to the URL Shortener API");
});

export default app;
