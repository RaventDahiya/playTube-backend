import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!mongoose.isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID.");
  }
  const comments = await Comment.find({ video: videoId })
    .populate("user", "username profilePicture")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();
  if (!comments || comments.length === 0) {
    throw new apiError(404, "No comments found for this video.");
  }
  return apiResponse(res, 200, comments, "Comments retrieved successfully.");
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  if (!mongoose.isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID.");
  }
  if (!content || content.trim() === "") {
    throw new apiError(400, "Comment content cannot be empty.");
  }
  const newComment = await Comment.create({
    video: videoId,
    user: req.user._id,
    content: content.trim(),
  });
  return apiResponse(res, 201, newComment, "Comment added successfully.");
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  if (!mongoose.isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid comment ID.");
  }
  if (!content || content.trim() === "") {
    throw new apiError(400, "Comment content cannot be empty.");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new apiError(404, "Comment not found.");
  }
  if (comment.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to update this comment.");
  }
  comment.content = content.trim();
  await comment.save();
  return apiResponse(res, 200, comment, "Comment updated successfully.");
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!mongoose.isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid comment ID.");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new apiError(404, "Comment not found.");
  }
  if (comment.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to delete this comment.");
  }
  await comment.remove();
  return apiResponse(res, 200, null, "Comment deleted successfully.");
});

export { getVideoComments, addComment, updateComment, deleteComment };
