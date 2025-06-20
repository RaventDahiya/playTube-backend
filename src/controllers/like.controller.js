import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID");
  }
  const userId = req.user._id;
  const existingLike = await Like.findOne({ video: videoId, user: userId });
  if (existingLike) {
    // Unlike the video
    await Like.deleteOne({ video: videoId, user: userId });
    return apiResponse(res, 200, null, "Video unliked successfully");
  } else {
    // Like the video
    const newLike = await Like.create({ video: videoId, user: userId });
    return apiResponse(res, 201, newLike, "Video liked successfully");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid comment ID");
  }
  const userId = req.user._id;
  const existingLike = await Like.findOne({ comment: commentId, user: userId });
  if (existingLike) {
    // Unlike the comment
    await Like.deleteOne({ comment: commentId, user: userId });
    return apiResponse(res, 200, null, "Comment unliked successfully");
  } else {
    // Like the comment
    const newLike = await Like.create({ comment: commentId, user: userId });
    return apiResponse(res, 201, newLike, "Comment liked successfully");
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Invalid tweet ID");
  }
  const userId = req.user._id;
  const existingLike = await Like.findOne({ tweet: tweetId, user: userId });
  if (existingLike) {
    // Unlike the tweet
    await Like.deleteOne({ tweet: tweetId, user: userId });
    return apiResponse(res, 200, null, "Tweet unliked successfully");
  } else {
    // Like the tweet
    const newLike = await Like.create({ tweet: tweetId, user: userId });
    return apiResponse(res, 201, newLike, "Tweet liked successfully");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;
  const likedVideos = await Like.aggregate([
    { $match: { user: userId, video: { $exists: true } } },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    { $unwind: "$videoDetails" },
    {
      $project: {
        _id: 1,
        videoId: "$videoDetails._id",
        title: "$videoDetails.title",
        thumbnail: "$videoDetails.thumbnail",
        createdAt: 1,
      },
    },
  ]);
  return apiResponse(
    res,
    200,
    likedVideos,
    "Liked videos fetched successfully"
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
