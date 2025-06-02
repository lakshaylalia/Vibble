import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "id",
          as: "owner",
          pipeline: [
            {
              $project: {
                _id: 1,
                userName: 1,
                avatar: 1,
                fullName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
        },
      },
      {
        $sort : {
          createdAt: -1,
        }
      },
      {
        $skip : skip,
      },
      {
        $limit : limit,
      }
    ]);
    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const addComment = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new ApiError(400, "Comment cannot be empty");
    }

    const comment = await Comment.create({
      content: content.trim(),
      video: videoId,
      owner: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment added successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const updateComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const { updatedComment } = req.body;

    if (!updateComment) {
      throw new ApiError(400, "Comment cannot be empty");
    }
    let comment = await Comment.findByIdAndUpdate(commentId, {
      $set: {
        content: updatedComment.trim(),
      },
    }, {new : true});
    if(!comment) {
      throw new ApiError(400, "Comment not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;

    await Comment.findByIdAndDelete(commentId);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
