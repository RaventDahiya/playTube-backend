import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscriptions.models.js";
import { Like } from "../models/like.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!mongoose.isValidObjectId(channelId)) {
    throw new apiError(400, "Invalid channel ID.");
  }
  const channelVideos = await Video.find({ channel: channelId }).lean();
  if (!channelVideos || channelVideos.length === 0) {
    throw new apiError(404, "Channel not found or no videos uploaded.");
  }
  const totalViews = channelVideos.reduce(
    (acc, video) => acc + (video.views || 0),
    0
  );
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });
  const totalVideos = channelVideos.length;
  const totalLikes = await Like.countDocuments({
    video: { $in: channelVideos.map((video) => video._id) },
  });
  return apiResponse(
    res,
    200,
    {
      totalViews,
      totalSubscribers,
      totalVideos,
      totalLikes,
    },
    "Channel stats retrieved successfully."
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!mongoose.isValidObjectId(channelId)) {
    throw new apiError(400, "Invalid channel ID.");
  }
  const channelVideos = await Video.find({ channel: channelId })
    .sort({ createdAt: -1 })
    .lean();
  if (!channelVideos || channelVideos.length === 0) {
    throw new apiError(404, "No videos found for this channel.");
  }
  return apiResponse(
    res,
    200,
    channelVideos,
    "Channel videos retrieved successfully."
  );
});

export { getChannelStats, getChannelVideos };
