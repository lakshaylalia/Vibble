import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }
    let liked = await Like.findOne({ likedBy: req.user?._id, video: videoId });
    let isLiked = false;
    if (liked) {
      isLiked = false;
      await Like.findOneAndDelete({ likedBy: req.user?._id, video: videoId });
    } else {
      liked = await Like.create({ likedBy: req.user?._id, video: videoId });
      isLiked = true;
    }
    if (isLiked) {
      return res
        .status(200)
        .json(new ApiResponse(200, liked, "Liked successfully"));
    } else {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Unliked successfully"));
    }
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment ID");
    }

    let isCommentLiked;

    let comment = await Like.findOne({
      likedBy: req.user?._id,
      comment: commentId,
    });

    if (comment) {
      isCommentLiked = false;
      await Like.findOneAndDelete({
        likedBy: req.user?._id,
        comment: commentId,
      });
    } else {
      isCommentLiked = true;
      comment = await Like.create({
        likedBy: req.user?._id,
        comment: commentId,
      });
    }

    if (!isCommentLiked) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment unliked successfully"));
    } else {
      return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment liked successfully"));
    }
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet ID");
    }

    let isTweetLiked;

    let tweet = await Like.findOne({ tweet: tweetId, likedBy: req.user?._id });

    if (tweet) {
      isTweetLiked = false;
      await Like.findOneAndDelete({ tweet: tweetId, likedBy: req.user?._id });
    } else {
      tweet = await Like.create({ tweet: tweetId, likedBy: req.user?._id });
      isTweetLiked = true;
    }

    if (!isTweetLiked) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet unliked successfully"));
    } else {
      return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet liked successfully"));
    }
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const likedVideos = await Like.aggregate([
      {
        $match: {
          likedBy: req.user?._id,
          video: { $exists: true },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videos",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: { $first: "$owner" },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          video: { $first: "$videos" },
        },
      },
      {
        $project: {
          _id: 0,
          video: 1,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, likedVideos, "Liked videos"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
