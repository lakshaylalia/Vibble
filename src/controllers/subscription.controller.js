import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscriptions.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw new ApiError(400, "Invalid channel ID");
    }

    let subscriber = await Subscription.findOne({
      channel: id,
      subscriber: req.user?._id,
    });

    if (subscriber) {
      await Subscription.deleteOne({
        subscriber: req.user?._id,
        channel: id,
      });
      return res.status(200).json(new ApiResponse(200, null, "Unsubscribed"));
    }

    subscriber = await Subscription.create({
      channel: id,
      subscriber: req.user?._id,
    });

    return res.status(200).json(new ApiResponse(200, subscriber, "Subscribed"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId });

    return res
      .status(200)
      .json(new ApiResponse(200, subscribers, "Subscribers"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscribedChannels = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          let: { channelId: "$channel" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$channel", "$$channelId"] },
              },
            },
            {
              $count: "subscriberCount",
            },
          ],
          as: "subscriberStats",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channelData",
          pipeline: [
            {
              $project: {
                _id: 1,
                userName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      { $unwind: "$channelData" },
      {
        $addFields: {
          subscriberCount: {
            $ifNull: [
              { $arrayElemAt: ["$subscriberStats.subscriberCount", 0] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: "$channelData._id",
          userName: "$channelData.userName",
          avatar: "$channelData.avatar",
          subscriberCount: 1,
        },
      },
    ]);

    if (!subscribedChannels || subscribedChannels.length === 0) {
      throw new ApiError(404, "No subscribed channels found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, subscribedChannels, "Subscribed channels"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
