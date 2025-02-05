import Analytics from "../models/Analytics.js";
import Url from "../models/Url.js";
import moment from "moment";
import redisClient from "../config/redis.js";

export const getUrlAnalytics = async (req, res) => {
  console.log("getUrlAnalytics");
  try {
    const { alias } = req.params;
    const cacheKey = `urlAnalytics:${alias}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        message: "Data retrieved from redis",
        data: JSON.parse(cachedData),
      });
    }

    const shortUrl = await Url.findOne({ alias });
    console.log("shortUrl", shortUrl);
    if (!shortUrl) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    const urlId = shortUrl._id;

    const analyticsData = await Analytics.find({ url: urlId });
    const totalClicks = analyticsData.length;
    const uniqueUsers = new Set(analyticsData.map((entry) => entry.ip)).size;

    const sevenDaysAgo = moment().subtract(7, "days").startOf("day");

    const clicksByDate = await Analytics.aggregate([
      { $match: { url: urlId, timestamp: { $gte: sevenDaysAgo.toDate() } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const osType = await Analytics.aggregate([
      { $match: { url: urlId } },
      {
        $group: {
          _id: "$os",
          uniqueClicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$ip" },
        },
      },
      {
        $project: {
          osName: "$_id",
          uniqueClicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          _id: 0,
        },
      },
    ]);

    const deviceType = await Analytics.aggregate([
      { $match: { url: urlId } },
      {
        $group: {
          _id: "$device",
          uniqueClicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$ip" },
        },
      },
      {
        $project: {
          deviceName: "$_id",
          uniqueClicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          _id: 0,
        },
      },
    ]);

    const response = {
      success: true,
      totalClicks,
      uniqueUsers,
      clicksByDate,
      osType,
      deviceType,
    };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(response));

    return res.status(200).json(response);
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getUrlAnalyticsByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    const cacheKey = `urlAnalyticsByTopic:${topic}`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        message: "Data retrieved from redis",
        data: JSON.parse(cachedData),
      });
    }

    const urls = await Url.find({ topic }).select("_id shortUrl");

    if (urls.length === 0) {
      return res.status(404).json({ message: "No URLs found for this topic" });
    }

    const analyticsData = await Analytics.aggregate([
      {
        $match: {
          url: { $in: urls.map((url) => url._id) },
        },
      },
      {
        $group: {
          _id: "$url",
          totalClicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$ip" },
          clicksByDate: {
            $push: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              clicks: 1,
            },
          },
        },
      },
      {
        $lookup: {
          from: "urls",
          localField: "_id",
          foreignField: "_id",
          as: "urlDetails",
        },
      },
      {
        $project: {
          shortUrl: { $arrayElemAt: ["$urlDetails.shortUrl", 0] },
          totalClicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          clicksByDate: 1,
        },
      },
    ]);

    const totalClicks = analyticsData.reduce(
      (acc, curr) => acc + curr.totalClicks,
      0
    );
    const uniqueUsers = analyticsData.reduce(
      (acc, curr) => acc + curr.uniqueUsers,
      0
    );

    const response = {
      totalClicks,
      uniqueUsers,
      clicksByDate: analyticsData.flatMap((item) => item.clicksByDate),
      urls: analyticsData.map((item) => ({
        shortUrl: item.shortUrl,
        totalClicks: item.totalClicks,
        uniqueUsers: item.uniqueUsers,
      })),
    };

    redisClient.setEx(cacheKey, 3600, JSON.stringify(response));

    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getOverallAnalytics = async (req, res) => {
  try {
    const userId = req.user;
    const cacheKey = `overallAnalytics:${userId}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        message: "Data retrieved from redis",
        data: JSON.parse(cachedData),
      });
    }

    const urls = await Url.find({ user: userId });

    if (urls.length === 0) {
      return res.status(404).json({ message: "No URLs found for this user" });
    }

    const urlIds = urls.map((url) => url._id);

    const analyticsData = await Analytics.aggregate([
      {
        $match: { url: { $in: urlIds } },
      },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$ip" },
          clicksByDate: {
            $push: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              clicks: 1,
            },
          },
          osType: {
            $push: {
              os: "$os",
              ip: "$ip",
            },
          },
          deviceType: {
            $push: {
              device: "$device",
              ip: "$ip",
            },
          },
        },
      },
    ]);

    const totalClicks = analyticsData[0]?.totalClicks || 0;
    const uniqueUsers = new Set(analyticsData[0]?.uniqueUsers || []).size;
    const clicksByDate = analyticsData[0]?.clicksByDate || [];

    const osType = analyticsData[0]?.osType.reduce((acc, { os, ip }) => {
      if (!acc[os]) {
        acc[os] = { uniqueClicks: 0, uniqueUsers: new Set() };
      }
      acc[os].uniqueClicks += 1;
      acc[os].uniqueUsers.add(ip);
      return acc;
    }, []);

    const deviceType = analyticsData[0]?.deviceType.reduce(
      (acc, { device, ip }) => {
        if (!acc[device]) {
          acc[device] = { uniqueClicks: 0, uniqueUsers: new Set() };
        }
        acc[device].uniqueClicks += 1;
        acc[device].uniqueUsers.add(ip);
        return acc;
      },
      []
    );

    const formattedOsType = Object.keys(osType).map((os) => ({
      osName: os,
      uniqueClicks: osType[os].uniqueClicks,
      uniqueUsers: osType[os].uniqueUsers.size,
    }));

    const formattedDeviceType = Object.keys(deviceType).map((device) => ({
      deviceName: device,
      uniqueClicks: deviceType[device].uniqueClicks,
      uniqueUsers: deviceType[device].uniqueUsers.size,
    }));

    const response = {
      success:true,
      totalUrls: urls.length,
      totalClicks,
      uniqueUsers,
      clicksByDate,
      osType: formattedOsType,
      deviceType: formattedDeviceType,
    };

    redisClient.setEx(cacheKey, 3600, JSON.stringify(response));

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
