const path = require('path');

exports.PATH_TMP = path.join(__dirname, process.env.PATH_TMP || 'tmp');
