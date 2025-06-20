import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const { _id: userId } = req.user;
  if (!content || content.trim() === "") {
    throw new apiError(400, "Content cannot be empty");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found");
  }
  const tweet = await Tweet.create({
    content,
    user: userId,
  });
  return apiResponse(res, 201, tweet, "Tweet created successfully");
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid user ID");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found");
  }
  const tweets = await Tweet.aggregate([
    {
      $match: { user: userId },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $project: {
        _id: 1,
        content: 1,
        createdAt: 1,
        userDetails: {
          _id: "$userDetails._id",
          name: "$userDetails.name",
          username: "$userDetails.username",
          profilePicture: "$userDetails.profilePicture",
        },
      },
    },
  ]);
  return apiResponse(res, 200, tweets, "User tweets fetched successfully");
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Invalid tweet ID");
  }
  if (!content || content.trim() === "") {
    throw new apiError(400, "Content cannot be empty");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new apiError(404, "Tweet not found");
  }
  if (tweet.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to update this tweet");
  }
  tweet.content = content;
  await tweet.save();
  return apiResponse(res, 200, tweet, "Tweet updated successfully");
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Invalid tweet ID");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new apiError(404, "Tweet not found");
  }
  if (tweet.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to delete this tweet");
  }
  await tweet.remove();
  return apiResponse(res, 200, null, "Tweet deleted successfully");
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
