const { sql } = require('slonik');
const connection = require('./db');

const MAX_PROXY_ERRORS = 3;

//-----------------------------

exports.getProxy = () => connection.maybeOne(sql`
  SELECT id, server, "lastActive" FROM "Proxies"
    WHERE "amountErrors" <= ${MAX_PROXY_ERRORS}
    ORDER BY "lastActive" NULLS FIRST, id
    LIMIT 1;
`);

//-----------------------------

exports.getAmountProxy = () => connection.maybeOne(sql`
  SELECT COUNT(*) AS all,
         COUNT(*) FILTER (WHERE "amountErrors" = 0) AS working
    FROM "Proxies"
`);

//-----------------------------

exports.getProxies = async () => (await connection.query(sql`
  SELECT id, server, "amountErrors", "lastActive" FROM "Proxies"
    WHERE "amountErrors" = 0
    ORDER BY "lastActive" NULLS FIRST, id
`)).rows;

//-----------------------------

exports.setErrorProxy = id => connection.query(sql`
  UPDATE "Proxies" SET "amountErrors" = "amountErrors" + 1 WHERE id = ${id}
`);

//-----------------------------

exports.resetErrorProxy = id => connection.query(sql`
  UPDATE "Proxies" SET "amountErrors" = 0 WHERE id = ${id}
`);

//-----------------------------

exports.setLastActiveProxy = id => connection.query(sql`
  UPDATE "Proxies" SET "lastActive" = TO_TIMESTAMP(${Date.now() / 1000}) WHERE id = ${id};
`);

//-----------------------------

exports.addProxies = async servers => connection.query(sql`
  INSERT INTO "Proxies" (server)
    SELECT * FROM
      ${sql.unnest([...servers.map(el => [el])], ['text'])}
    ON CONFLICT (server) DO NOTHING;
`);

//-----------------------------

exports.getLastCode = async () => (await connection.one(sql`
  SELECT COALESCE(MAX(code), '') AS code FROM "Organizations";
`)).code;
