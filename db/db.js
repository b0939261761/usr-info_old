const { createPool } = require('slonik');
const { createQueryLoggingInterceptor } = require('slonik-interceptor-query-logging');

const interceptors = process.env.NODE_ENV !== 'production' ? [createQueryLoggingInterceptor()] : [];

const connect = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}`
  + `@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

module.exports = createPool(connect, { interceptors });
