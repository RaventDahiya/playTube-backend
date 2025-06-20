class apiError extends Error {
  constructor(
    statusCode,
    message = "something went wrong",
    errors = [], // Correct parameter name
    stack = ""
  ) {
    //overriding the constructor
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors; // Use the correct parameter name

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { apiError };
