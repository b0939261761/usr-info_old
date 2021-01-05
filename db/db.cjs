const { createPool } = require('slonik');
const { createQueryLoggingInterceptor } = require('slonik-interceptor-query-logging');

const interceptors = process.env.NODE_ENV !== 'production' ? [createQueryLoggingInterceptor()] : [];

const connect = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}`
  + `@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

module.exports = createPool(connect, { interceptors });
