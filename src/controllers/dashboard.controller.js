import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscriptions.models.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  try {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const totalVideos = await Video.countDocuments({ owner: req.user?._id });
    const totalSubscribers = await Subscription.countDocuments({
      channel: req.user?._id,
    });
    const totalViewsResult = await Video.aggregate([
      {
        $match: {
            owner : req.user?._id,
        },
      },
      {
        $group: {
            _id: null,
            totalViews: {
                $sum : "$views",
            }
        }
      }
    ]);
    const totalViews = totalViewsResult[0]?.totalViews || 0;

    return res.status(200).json(new ApiResponse(200, { totalViews, totalSubscribers, totalVideos }, "Channel Stats"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  try {
    const videos = await Video.find({ owner: req.user?._id });

    if (!videos) {
      throw new ApiError(404, "No videos found");
    }

    return res.status(200).json(new ApiResponse(200, videos, "Videos"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export { getChannelStats, getChannelVideos };
