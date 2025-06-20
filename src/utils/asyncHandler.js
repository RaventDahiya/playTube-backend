export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(error.code || 500)
//       .json({ success: false, message: "Server Error" });
//   }
// };
