import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscriptions.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  const { _id: subscriberId } = req.user;
  if (!isValidObjectId(channelId)) {
    throw new apiError(400, "Invalid channel ID");
  }
  if (subscriberId === channelId) {
    throw new apiError(400, "You cannot subscribe to your own channel");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new apiError(404, "Channel not found");
  }
  const subscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });
  if (subscription) {
    // Unsubscribe
    await Subscription.findByIdAndDelete(subscription._id);
    return apiResponse(res, 200, "Unsubscribed successfully");
  }
  // Subscribe
  const newSubscription = await Subscription.create({
    subscriber: subscriberId,
    channel: channelId,
  });
  return apiResponse(res, 201, newSubscription, "Subscribed successfully");
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new apiError(400, "Invalid channel ID");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new apiError(404, "Channel not found");
  }
  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: channelId },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    {
      $unwind: "$subscriberDetails",
    },
    {
      $project: {
        _id: 0,
        subscriberId: "$subscriberDetails._id",
        username: "$subscriberDetails.username",
        fullName: "$subscriberDetails.fullName",
        profilePicture: "$subscriberDetails.profilePicture",
      },
    },
  ]);

  return apiResponse(200, subscribers, "Subscribers fetched successfully");
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new apiError(400, "Invalid subscriber ID");
  }
  const subscriber = await User.findById(subscriberId);
  if (!subscriber) {
    throw new apiError(404, "Subscriber not found");
  }
  const subscriptions = await Subscription.aggregate([
    {
      $match: { subscriber: subscriberId },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails",
      },
    },
    {
      $unwind: "$channelDetails",
    },
    {
      $project: {
        _id: 0,
        channelId: "$channelDetails._id",
        username: "$channelDetails.username",
        fullName: "$channelDetails.fullName",
        profilePicture: "$channelDetails.profilePicture",
      },
    },
  ]);
  return apiResponse(
    200,
    subscriptions,
    "Subscribed channels fetched successfully"
  );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
