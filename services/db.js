const { createPool, sql } = require('slonik');
const { createQueryLoggingInterceptor } = require('slonik-interceptor-query-logging');

const interceptors = process.env.NODE_ENV !== 'production' ? [createQueryLoggingInterceptor()] : [];

const connect = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}`
  + `@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const connection = createPool(connect, { interceptors });

exports.getProxies = async () => (await connection.query(sql`
  SELECT id, server, "lastActive" FROM "Proxies" WHERE active = true ORDER BY id
`)).rows;


exports.setDisableProxy = id => connection.query(sql`
  UPDATE "Proxies" SET active = false WHERE id = ${id}
`);

exports.setLastActiveProxy = id => connection.query(sql`
  UPDATE "Proxies" SET "lastActive" = TO_TIMESTAMP(${Date.now() / 1000}) WHERE id = ${id}
`);

exports.getLastCode = async () => (await connection.one(sql`
  SELECT COALESCE(MAX(code), '') AS code FROM "Organization"
`)).code;

exports.addOrganization = async org => connection.query(sql`
  INSERT INTO "Organization" (code, "captchaId", "fullName", "fullNameEn", "address", "phone")
    VALUES (${org.code}, ${org.captchaId}, ${org.fullName},
      ${org.fullNameEn}, ${org.address}, ${org.phone})
`);
