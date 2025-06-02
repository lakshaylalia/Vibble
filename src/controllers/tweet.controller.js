import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      throw new ApiError(400, "Content is required");
    }
    const tweet = await Tweet.create({
      owner: req.user?._id,
      content: content.trim(),
    });
    return res.status(200).json(new ApiResponse(201, tweet, "Tweet created"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const tweets = await Tweet.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup : {
            from : "users",
            localField : "owner",
            foreignField : "_id",
            as : "owner",
            pipeline : [
                {
                    $project : {
                        userName : 1,
                        avatar : 1,
                    }
                },
            ]
        }
      },
      {
        $addFields : {
            owner : {
                $first : "$owner"
            }
        }
      }
    ]);
    return res.status(200).json(new ApiResponse(200, tweets, "User tweets"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  try {
    const {tweetId} = req.params;
    const {updatedTweet} = req.body;
    if(!updateTweet) {
        throw new ApiError(400, "Tweet is required");
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set : {
            content : updatedTweet,
        }
    }, { new : true });

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;

    await Tweet.findByIdAndDelete(tweetId);
    return res.status(200).json(new ApiResponse(200,{}, "Tweet deleted"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
