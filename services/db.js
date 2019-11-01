const { createPool, sql } = require('slonik');
const { createQueryLoggingInterceptor } = require('slonik-interceptor-query-logging');

const interceptors = process.env.NODE_ENV !== 'production' ? [createQueryLoggingInterceptor()] : [];

const connect = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}`
  + `@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const connection = createPool(connect, { interceptors });

exports.getProxy = () => connection.maybeOne(sql`
  SELECT id, server, "lastActive" FROM "Proxies"
    WHERE active = true
    ORDER BY "lastActive" NULLS FIRST, id
    LIMIT 1;
`);

exports.getProxies = async () => (await connection.query(sql`
  SELECT id, server, "lastActive" FROM "Proxies"
    WHERE active = true
    ORDER BY "lastActive" NULLS FIRST, id
`)).rows;

exports.setDisableProxy = id => connection.query(sql`
  UPDATE "Proxies" SET active = false WHERE id = ${id}
`);

exports.setLastActiveProxy = id => connection.query(sql`
  UPDATE "Proxies" SET "lastActive" = TO_TIMESTAMP(${Date.now() / 1000}) WHERE id = ${id};
`);


exports.addProxy = org => {
  const {
    code = '',
    fullName = '',
    person = '',
    address = '',
    phone = ''
  } = org;

  return connection.query(sql`
    INSERT INTO "Proxies" (server)
      VALUES ('test')
      ON CONFLICT (server) DO UPDATE NOTHING;
  `);
};

exports.getLastCode = async () => (await connection.one(sql`
  SELECT COALESCE(MAX(code), '') AS code FROM "Organization";
`)).code;

exports.addOrganization = org => {
  const {
    code = '',
    fullName = '',
    person = '',
    address = '',
    phone = ''
  } = org;

  return connection.query(sql`
    INSERT INTO "Organization" (code, "fullName", person, address, phone)
      VALUES (${code}, ${fullName}, ${person}, ${address}, ${phone})
      ON CONFLICT (code) DO UPDATE SET
        "fullName" = EXCLUDED."fullName",
        person = EXCLUDED.person,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone;
  `);
};
