import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  // Simple health check response
  return apiResponse(res, 200, null, "Server is running OK");
});

export { healthcheck };
