const dotenv = require('dotenv');

const env = process.env.NODE_ENV;
if (env !== 'production') dotenv.config();

module.exports = {
  client: 'postgresql',
  connection: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
  }
};
