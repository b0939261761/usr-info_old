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

exports.addProxies = async servers => connection.query(sql`
  INSERT INTO "Proxies" (server)
    SELECT * FROM
      ${sql.unnest([...servers.map(el => [el])], ['text'])}
    ON CONFLICT (server) DO NOTHING;
`);

exports.getLastCode = async () => (await connection.one(sql`
  SELECT COALESCE(MAX(code), '') AS code FROM "Organizations";
`)).code;

// ----------------------

exports.getOrganizations = async (where = {}) => {
  const createWhereFragment = ({ status, date }) => {
    if (date && status) return sql.raw('WHERE date("updatedAt") = $1 AND status = $2', [date, status]);
    if (date) return sql.raw('WHERE date("updatedAt") = $1', [date]);
    if (status) return sql.raw('WHERE status = $1', [status]);
    return sql.raw('');
  };

  return (await connection.query(sql`
    SELECT * FROM "Organizations" ${createWhereFragment(where)}
  `)).rows;
};

exports.addOrganization = org => {
  const {
    code = '',
    status,
    fullName = '',
    legalForm = '',
    name = '',
    address = '',
    founders = '',
    dataAuthorizedCapital = '',
    activities = '',
    persons = '',
    dateAndRecordNumber = '',
    contacts = ''
  } = org;

  return connection.query(sql`
    INSERT INTO "Organizations" (status, code, "fullName", "legalForm", name,
      address, founders, "dataAuthorizedCapital", activities,
      persons, "dateAndRecordNumber", contacts)
      VALUES (${status}, ${code}, ${fullName}, ${legalForm}, ${name},
        ${address}, ${founders}, ${dataAuthorizedCapital}, ${activities},
        ${persons}, ${dateAndRecordNumber}, ${contacts})
      ON CONFLICT (code) DO UPDATE SET
        status = EXCLUDED."status",
        "fullName" = EXCLUDED."fullName",
        "legalForm" = EXCLUDED."legalForm",
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        founders = EXCLUDED.founders,
        "dataAuthorizedCapital" = EXCLUDED."dataAuthorizedCapital",
        activities = EXCLUDED.activities,
        persons = EXCLUDED.persons,
        "dateAndRecordNumber" = EXCLUDED."dateAndRecordNumber",
        contacts = EXCLUDED.contacts;
  `);
};

exports.setStatusOrganizations = ({ ids, status }) => connection.query(sql`
  UPDATE "Organizations" SET status = ${status} WHERE id = ANY(${sql.array(ids, 'int4')})
`);
