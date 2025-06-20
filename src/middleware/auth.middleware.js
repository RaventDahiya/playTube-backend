import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) {
    throw new apiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new apiError(401, "Unauthorized request");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid or expired token");
  }
});
