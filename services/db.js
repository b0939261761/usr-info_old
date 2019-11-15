const { createPool, sql } = require('slonik');
const { createQueryLoggingInterceptor } = require('slonik-interceptor-query-logging');
const parseOrganization = require('./parseOrganization');

const interceptors = process.env.NODE_ENV !== 'production' ? [createQueryLoggingInterceptor()] : [];

const connect = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}`
  + `@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const connection = createPool(connect, { interceptors });

const MAX_PROXY_ERRORS = 3;

exports.getProxy = () => connection.maybeOne(sql`
  SELECT id, server, "lastActive" FROM "Proxies"
    WHERE "amountErrors" <= ${MAX_PROXY_ERRORS}
    ORDER BY "lastActive" NULLS FIRST, id
    LIMIT 1;
`);

exports.getProxies = async () => (await connection.query(sql`
  SELECT id, server, "lastActive" FROM "Proxies"
    WHERE "amountErrors" <= ${MAX_PROXY_ERRORS}
    ORDER BY "lastActive" NULLS FIRST, id
`)).rows;

exports.setErrorProxy = id => connection.query(sql`
  UPDATE "Proxies" SET "amountErrors" = "amountErrors" + 1 WHERE id = ${id}
`);

exports.resetErrorProxy = id => connection.query(sql`
  UPDATE "Proxies" SET "amountErrors" = 0 WHERE id = ${id}
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
    if (date && status) return sql`WHERE date("createdAt") = ${date} AND status = ${status}`;
    if (date) return sql`WHERE date("createdAt") = ${date}`;
    if (status) return sql`WHERE status = ${status}`;
    return sql``;
  };

  return (await connection.query(sql`
    SELECT * FROM "Organizations" ${createWhereFragment(where)}
      ORDER BY code
  `)).rows;
};

exports.addOrganization = organization => {
  const {
    code = '',
    status = 'none',
    fullName = '',
    legalForm = '',
    name = '',
    address = '',
    founders = '',
    dataAuthorizedCapital = '',
    activity = '',
    activities = '',
    persons = '',
    dateAndRecordNumber = '',
    contacts = '',
    stayInformation = ''
  } = organization;

  const {
    manager, capital, phone1, phone2, email
  } = parseOrganization({ contacts, dataAuthorizedCapital, persons });

  return connection.query(sql`
    INSERT INTO "Organizations" (status, code,
      manager, capital, phone1, phone2, email,
      "fullName", "legalForm", name,
      address, founders, "dataAuthorizedCapital", activity, activities,
      persons, "dateAndRecordNumber", contacts, "stayInformation")
      VALUES (${status}, ${code},
        ${manager}, ${capital}, ${phone1}, ${phone2}, ${email},
        ${fullName}, ${legalForm}, ${name},
        ${address}, ${founders}, ${dataAuthorizedCapital}, ${activity}, ${activities},
        ${persons}, ${dateAndRecordNumber}, ${contacts}, ${stayInformation})
      ON CONFLICT (code) DO UPDATE SET
        status = EXCLUDED.status,
        manager = EXCLUDED.manager,
        capital = EXCLUDED.capital,
        phone1 = EXCLUDED.phone1,
        phone2 = EXCLUDED.phone2,
        email = EXCLUDED.email,
        "fullName" = EXCLUDED."fullName",
        "legalForm" = EXCLUDED."legalForm",
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        founders = EXCLUDED.founders,
        "dataAuthorizedCapital" = EXCLUDED."dataAuthorizedCapital",
        activity = EXCLUDED.activity,
        activities = EXCLUDED.activities,
        persons = EXCLUDED.persons,
        "dateAndRecordNumber" = EXCLUDED."dateAndRecordNumber",
        contacts = EXCLUDED.contacts,
        "stayInformation" = EXCLUDED."stayInformation";
  `);
};

exports.setStatusOrganization = ({ id, status }) => connection.query(sql`
  UPDATE "Organizations" SET status = ${status} WHERE id = ${id};
`);

exports.setOrganization = organization => {
  const {
    id,
    code = '',
    status = 'none',
    fullName = '',
    legalForm = '',
    name = '',
    address = '',
    founders = '',
    dataAuthorizedCapital = '',
    activity = '',
    activities = '',
    persons = '',
    dateAndRecordNumber = '',
    contacts = '',
    stayInformation = ''
  } = organization;

  const {
    manager, capital, phone1, phone2, email
  } = parseOrganization({ contacts, dataAuthorizedCapital, persons });

  return connection.query(sql`
    UPDATE "Organizations" SET
      code = ${code},
      status = ${status},
      manager = ${manager},
      capital = ${capital},
      phone1 = ${phone1},
      phone2 = ${phone2},
      email = ${email},
      "fullName" = ${fullName},
      "legalForm" = ${legalForm},
      name = ${name},
      address = ${address},
      founders = ${founders},
      "dataAuthorizedCapital" = ${dataAuthorizedCapital},
      activity = ${activity},
      activities = ${activities},
      persons = ${persons},
      "dateAndRecordNumber" = ${dateAndRecordNumber},
      contacts = ${contacts},
      "stayInformation" = ${stayInformation}
    WHERE id = ${id};
  `);
};
