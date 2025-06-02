import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      query,
      sortBy = "createdAt",
      sortType = "desc",
      userId,
    } = req.query;

    const skip = (page - 1) * limit;

    const sortDirection = sortType === "asc" ? 1 : -1;
    const matchFilter = {
      owner: new mongoose.Types.ObjectId(userId),
    };
    
    if (query) {
      matchFilter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    const videos = await Video.aggregate([
      {
        $match: {
          owner: matchFilter,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                userName: 1,
                avatar: 1,
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
        $sort: {
          [sortBy]: sortDirection,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (!videos) {
      return new ApiError(404, "Videos not found");
    }

    return res.status(200).json(new ApiResponse(200, videos, "Videos found"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      throw new ApiError(400, "Title and description are required");
    }

    const videoFile = req.files?.videoFile[0].path;
    const thumbnail = req.files?.thumbnail[0].path;

    if (!videoFile || !thumbnail) {
      throw new ApiError(400, "Video and thumbnail are required");
    }

    const uploadedVideo = await uploadOnCloudinary(videoFile);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnail);
    if (!uploadedVideo.url) {
      throw new ApiError(500, "Failed to upload video to Cloudinary");
    }
    if (!uploadedThumbnail.url) {
      throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
    }
    const video = await Video.create({
      videoFile: uploadedVideo?.url,
      thumbnail: uploadedThumbnail?.url,
      title,
      description,
      duration: uploadedVideo?.duration,
      isPublished: true,
      owner: req.user?._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, video, "Video published successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                userName: 1,
                avatar: 1,
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
    ]);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video found"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { updatedTitle, updatedDescription } = req.body;
    if (!updatedTitle && !updatedDescription) {
      throw new ApiError(400, "Title and description are required");
    }

    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url) {
      throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
    }

    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title: updatedTitle ? updatedTitle : video.title,
          description: updatedDescription
            ? updatedDescription
            : video.description,
          thumbnail: thumbnail?.url,
        },
      },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
      throw new ApiError(404, "Video not found");
    }

    await Comment.deleteMany({ video: videoId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Video and associated comments deleted successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;

    const updatedVideo = await video.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedVideo, "Video status toggled successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
