const { sql } = require('slonik');
const connection = require('./db');

const MAX_PROXY_ERRORS = 3;

//-----------------------------

exports.getProxy = () => connection.maybeOne(sql`
  SELECT id, server, protocol, username, password, "lastActive" FROM "Proxies"
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
  SELECT id, server, protocol, username, password, "amountErrors", "lastActive" FROM "Proxies"
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

exports.addProxies = proxies => {
  const values = sql.unnest(
    [...proxies.map(el => [el.server, el.protocol, el.username, el.password])],
    ['text', 'text', 'text', 'text']
  );

  return connection.query(sql`
    INSERT INTO "Proxies" (server, protocol, username, password)
      SELECT server, protocol, username, password FROM
        ${values} AS tmp(server, protocol, username, password)
      ON CONFLICT (server) DO UPDATE SET
        protocol = EXCLUDED.protocol,
        username = EXCLUDED.username,
        password = EXCLUDED.password;
  `);
};
