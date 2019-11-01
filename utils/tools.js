exports.delay = timeout => new Promise(r => setTimeout(r, timeout));

exports.catchAsyncRoute = fn => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};
