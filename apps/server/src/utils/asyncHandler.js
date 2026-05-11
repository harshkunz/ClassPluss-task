function asyncHandler(fn) {
  return function asyncWrapper(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
