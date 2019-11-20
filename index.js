const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') dotenv.config();

require('./init');
require('./server');
require('./scheduler');
// require('./services/runGrabber');
