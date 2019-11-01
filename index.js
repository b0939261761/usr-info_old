/* eslint-disable no-await-in-loop */

const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') dotenv.config();

require('./services/runGrabber')();
