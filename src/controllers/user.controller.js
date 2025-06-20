import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefereshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // validateBeforeSave: false to skip validation no need for password hashing
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "Internal server error while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // req body -> data
  const { fullName, email, username, password } = req.body;

  // check if all fields are provided
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  // check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] }); // Check if user exists by email or username
  if (userExists) {
    throw new apiError(409, "User already exists");
  }

  // check for avatar and cover image (avatar is required, cover image is optional)
  let coverImageLocalPath;
  if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar is required");
  }
  // upload avatar and cover image to cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // check if cover image is uploaded required field
  if (!avatar) {
    throw new apiError(500, "avatar upload failed required field");
  }

  // Create a new user
  const user = await User.create({
    fullname: fullName,
    email,
    username: username.toLowerCase(),
    passwords: hashedPassword, // Save hashed password
    avatar: avatar.url,
    coverImage: coverImage?.url || null, // Save cover image URL or null if not provided"",
  });

  // Check if user is created successfully
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken" // Exclude sensitive fields
  );
  if (!createUser) {
    throw new apiError(500, "Error while creating user in DB");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  const { email, username, password } = req.body;
  console.log(email, username);

  if (!email && !username) {
    throw new apiError(400, "Email or username is required");
  }

  // find user
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new apiError(404, "Invalid credentials");
  }

  // password check
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid credentials");
  }
  //access token and refresh token
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefereshToken(user._id);
  //send cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken" // Exclude sensitive fields
  );
  const options = {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookies
    secure: true, // Ensures cookies are sent over HTTPS only
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new apiError(401, "unauthorized request, refresh token is required");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new apiError(401, "Invalid refresh token");
    }
    if (user?.refreshToken !== incomingRefreshToken) {
      throw new apiError(401, "refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefereshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new apiError(400, "All fields are required");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new apiError(404, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid credentials");
  }
  user.passwords = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new apiResponse(200, null, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new apiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullName,
        email,
      },
    },
    { new: true } // Return the updated user document
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, user, "User updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new apiError(500, "Error uploading Avatar to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, user, "user avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new apiError(400, "Cover image is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new apiError(500, "Error uploading Cover image to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, user, "User cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new apiError(400, "Username is required");
  }
  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        subscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscriber.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        subscriberCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new apiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, channel[0], "Channel profile fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $arrayElemAt: ["$owner", 0] }, // Get the first element of the owner array
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  generateAccessTokenAndRefereshToken,
  getUserChannelProfile,
  getWatchHistory,
};
