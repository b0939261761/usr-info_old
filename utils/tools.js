exports.delay = timeout => new Promise(r => setTimeout(r, timeout));

exports.catchAsyncRoute = fn => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};

const zeroStart = (num, digits = 2) => num.toString().padStart(digits, '0');

exports.zeroStart = zeroStart;
