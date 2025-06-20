import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || name.trim() === "") {
    throw new apiError(400, "Playlist name is required.");
  }
  const playlist = await Playlist.create({
    name: name.trim(),
    description: description?.trim() || "",
    user: req.user._id,
    videos: [],
  });
  return apiResponse(res, 201, playlist, "Playlist created successfully.");
});

// Get all playlists for a user
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid user ID.");
  }
  const playlists = await Playlist.find({ user: userId }).lean();
  return apiResponse(
    res,
    200,
    playlists,
    "User playlists fetched successfully."
  );
});

// Get a playlist by its ID
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "Invalid playlist ID.");
  }
  const playlist = await Playlist.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(playlistId) } },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
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
        name: 1,
        description: 1,
        createdAt: 1,
        user: {
          _id: "$userDetails._id",
          username: "$userDetails.username",
          profilePicture: "$userDetails.profilePicture",
        },
        videos: "$videoDetails",
      },
    },
  ]);
  if (!playlist.length) {
    throw new apiError(404, "Playlist not found.");
  }
  return apiResponse(res, 200, playlist[0], "Playlist fetched successfully.");
});

// Add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid playlist or video ID.");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new apiError(404, "Playlist not found.");
  }
  // Prevent duplicate videos
  if (playlist.videos.includes(videoId)) {
    throw new apiError(400, "Video already in playlist.");
  }
  playlist.videos.push(videoId);
  await playlist.save();
  return apiResponse(res, 200, playlist, "Video added to playlist.");
});

// Remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid playlist or video ID.");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new apiError(404, "Playlist not found.");
  }
  playlist.videos = playlist.videos.filter(
    (vid) => vid.toString() !== videoId.toString()
  );
  await playlist.save();
  return apiResponse(res, 200, playlist, "Video removed from playlist.");
});

// Delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "Invalid playlist ID.");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new apiError(404, "Playlist not found.");
  }
  // Optional: Only allow owner to delete
  if (playlist.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to delete this playlist.");
  }
  await playlist.deleteOne();
  return apiResponse(res, 200, null, "Playlist deleted successfully.");
});

// Update a playlist's name/description
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "Invalid playlist ID.");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new apiError(404, "Playlist not found.");
  }
  // Optional: Only allow owner to update
  if (playlist.user.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to update this playlist.");
  }
  if (name) playlist.name = name.trim();
  if (description !== undefined) playlist.description = description.trim();
  await playlist.save();
  return apiResponse(res, 200, playlist, "Playlist updated successfully.");
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
