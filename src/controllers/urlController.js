import Url from "../models/Url.js";
import Analytics from "../models/Analytics.js";
import { body, validationResult } from "express-validator";
import { nanoid } from "nanoid";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";
import axios from "axios";
import redisClient from "../config/redis.js";
import moment from "moment";

export const createShortUrl = [
  body("longUrl")
    .isURL()
    .withMessage("Invalid URL format")
    .notEmpty()
    .withMessage("Long URL is required"),
  body("customAlias")
    .optional()
    .matches(/^[\w\-]+$/)
    .withMessage("Invalid alias format"),
  body("topic").optional().isString().withMessage("Topic must be a string"),

  async (req, res) => {
    console.log("Create Shorten Url");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { longUrl, customAlias, topic } = req.body;

      const user = req.session.passport.user;

      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User not logged in" });
      }
      if (customAlias) {
        const existingAlias = await Url.findOne({ alias: customAlias });
        if (existingAlias) {
          return res.status(400).json({ message: "Alias already taken" });
        }
      }

      const alias = customAlias || nanoid(6);
   
      const shortUrl = `${req.protocol}://${req.get("host")}/${alias}`;

      const newShortUrl = await Url.create({
        longUrl,
        shortUrl,
        alias,
        user: user,
        topic,
      });

      return res.status(200).json({
        message: "Short URL created successfully",
        shortUrl,
        createdAt: newShortUrl.createdAt,
        newShortUrl,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

export const redirectToOriginalUrl = async (req, res) => {
  const { alias } = req.params;
  const cacheKeyUrl = `shorturl:${alias}`;
  const cacheKeyAnalytics = `analytics:${alias}`;

  const cachedUrlData = await redisClient.get(cacheKeyUrl);
  if (cachedUrlData) {
    console.log("redis", cacheKeyUrl);
    return res.status(200).json({
      message: "Long url retrieved successfully from redis cache",
      longUrl: cachedUrlData,
    });
  }

  try {
    const shortUrl = await Url.findOne({ alias });

    if (!shortUrl) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    redisClient.setEx(cacheKeyUrl, 3600, shortUrl.longUrl);

    let ip = req.ip || req.headers["x-forwarded-for"];

    if (
      ip.startsWith("192.168") ||
      ip.startsWith("10.") ||
      ip === "127.0.0.1" ||
      ip === "::1"
    ) {
      const response = await axios.get("https://api64.ipify.org?format=json");
      ip = response.data.ip;
    }
    const userAgentString = req.headers["user-agent"];
    const geo = geoip.lookup(ip);
    const location = geo
      ? `${geo.city}, ${geo.region}, ${geo.country}`
      : "Unknown";

    const parser = new UAParser(userAgentString);
    const { os, device } = parser.getResult();

    const tenMinutesAgo = moment().subtract(10, "minutes").toDate();
    const existingAnalytics = await Analytics.findOne({
      url: shortUrl._id,
      ip: ip,
      timestamp: { $gte: tenMinutesAgo },
    });

    if (!existingAnalytics) {
      const analyticsData = new Analytics({
        url: shortUrl._id,
        userAgent: userAgentString,
        ip: ip,
        location: location,
        os: os.name || "Unknown",
        device: device.type || "Unknown",
      });

      redisClient.setEx(cacheKeyAnalytics, 3600, JSON.stringify(analyticsData));
      await analyticsData.save();
    } else {
      console.log("Duplicate analytics entry prevented.");
    }

    return res.status(200).json({
      message: "Long url retrieved successfully",
      longUrl: shortUrl.longUrl,
    });
    // res.redirect(shortUrl.longUrl);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
