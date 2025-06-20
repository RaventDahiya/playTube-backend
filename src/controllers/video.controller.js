import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get all videos with aggregation, filtering, sorting, and pagination
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  const match = {};
  if (query) {
    match.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId && isValidObjectId(userId)) {
    match.user = new mongoose.Types.ObjectId(userId);
  }
  const sort = {};
  sort[sortBy] = sortType === "asc" ? 1 : -1;

  const videos = await Video.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        videoUrl: 1,
        createdAt: 1,
        views: 1,
        user: {
          _id: "$userDetails._id",
          username: "$userDetails.username",
          profilePicture: "$userDetails.profilePicture",
        },
      },
    },
    { $sort: sort },
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
  ]);
  return apiResponse(res, 200, videos, "Videos fetched successfully.");
});

// Publish a video (upload to Cloudinary and create DB entry)
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !req.files?.video) {
    throw new apiError(400, "Title and video file are required.");
  }
  // Upload video to Cloudinary
  const videoUpload = await uploadOnCloudinary(
    req.files.video[0].path,
    "video"
  );
  let thumbnailUpload;
  if (req.files?.thumbnail) {
    thumbnailUpload = await uploadOnCloudinary(
      req.files.thumbnail[0].path,
      "image"
    );
  }
  const video = await Video.create({
    title: title.trim(),
    description: description?.trim() || "",
    videoUrl: videoUpload.secure_url,
    thumbnail: thumbnailUpload?.secure_url || "",
    user: req.user._id,
  });
  return apiResponse(res, 201, video, "Video published successfully.");
});

// Get video by ID with user details
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID.");
  }
  const video = await Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        videoUrl: 1,
        createdAt: 1,
        views: 1,
        user: {
          _id: "$userDetails._id",
          username: "$userDetails.username",
          profilePicture: "$userDetails.profilePicture",
        },
      },
    },
  ]);
  if (!video.length) {
    throw new apiError(404, "Video not found.");
  }
  return apiResponse(res, 200, video[0], "Video fetched successfully.");
});

// Update video details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID.");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found.");
  }
  if (video.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to update this video.");
  }
  if (title) video.title = title.trim();
  if (description !== undefined) video.description = description.trim();
  if (req.files?.thumbnail) {
    const thumbnailUpload = await uploadOnCloudinary(
      req.files.thumbnail[0].path,
      "image"
    );
    video.thumbnail = thumbnailUpload.secure_url;
  }
  await video.save();
  return apiResponse(res, 200, video, "Video updated successfully.");
});

// Delete a video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID.");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found.");
  }
  if (video.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to delete this video.");
  }
  await video.deleteOne();
  return apiResponse(res, 200, null, "Video deleted successfully.");
});

// Toggle publish status (e.g., published/unpublished)
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID.");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found.");
  }
  if (video.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to update this video.");
  }
  video.published = !video.published;
  await video.save();
  return apiResponse(
    res,
    200,
    video,
    `Video ${video.published ? "published" : "unpublished"} successfully.`
  );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
