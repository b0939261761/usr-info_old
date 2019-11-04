exports.delay = timeout => new Promise(r => setTimeout(r, timeout));

exports.catchAsyncRoute = fn => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};


exports.formatDateTime = timestamp => {
  const year = timestamp.getFullYear();
  const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
  const day = timestamp.getDate().toString().padStart(2, '0');

  const hours = timestamp.getHours().toString().padStart(2, '0');
  const minutes = timestamp.getDate().toString().padStart(2, '0');
  const seconds = timestamp.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
