const { sql } = require('slonik');
const connection = require('./db');
const parse = require('../organization/parse');

//-----------------------------

exports.getLastOrganization = () => connection.maybeOne(sql`
  SELECT code, "dateRegistration" FROM "Organizations" ORDER BY id DESC LIMIT 1;
`);

//-----------------------------

const whereFragmentGetOrganizations = ({
  status, year, month, day
} = {}) => {
  if (year && month && day && status) {
    return sql`WHERE EXTRACT(YEAR FROM "dateRegistration") = ${year}
      AND EXTRACT(MONTH FROM "dateRegistration") = ${month}
      AND EXTRACT(DAY FROM "dateRegistration") = ${day}
      AND status = ${status}`;
  }

  if (year && month && status) {
    return sql`WHERE EXTRACT(YEAR FROM "dateRegistration") = ${year}
      AND EXTRACT(MONTH FROM "dateRegistration") = ${month}
      AND status = ${status}`;
  }

  if (year && status) {
    return sql`WHERE EXTRACT(YEAR FROM "dateRegistration") = ${year}
      AND status = ${status}`;
  }

  if (status) {
    return sql`WHERE status = ${status}`;
  }

  if (year && month && day) {
    return sql`WHERE EXTRACT(YEAR FROM "dateRegistration") = ${year}
      AND EXTRACT(MONTH FROM "dateRegistration") = ${month}
      AND EXTRACT(DAY FROM "dateRegistration") = ${day}`;
  }

  if (year && month) {
    return sql`WHERE EXTRACT(YEAR FROM "dateRegistration") = ${year}
      AND EXTRACT(MONTH FROM "dateRegistration") = ${month}`;
  }

  if (year) {
    return sql`WHERE EXTRACT(YEAR FROM "dateRegistration") = ${year}`;
  }

  return sql``;
};

const sqlGetOrganizations = where => sql`
  SELECT * FROM "Organizations" ${whereFragmentGetOrganizations(where)} ORDER BY code;
`;

//-----------------------------

exports.getOrganizations = async options => (
  await connection.query(sqlGetOrganizations(options))
).rows;

//-----------------------------

exports.getOrganizationsStream = options => new Promise(
  resolve => connection.stream(sqlGetOrganizations(options), stream => resolve(stream))
);

//-----------------------------

const checkOrganization = organization => {
  const {
    dataAuthorizedCapital = '',
    persons = '',
    dateAndRecordNumber = '',
    contacts = '',
    activities = ''
  } = organization;

  const parseField = parse({
    contacts, dataAuthorizedCapital, persons, dateAndRecordNumber, activities
  });

  return {
    code: organization.code || '',
    status: organization.status || 'none',
    fullName: organization.fullName || '',
    legalForm: organization.legalForm || '',
    name: organization.name || '',
    address: organization.address || '',
    founders: organization.founders || '',
    stayInformation: organization.stayInformation || '',
    dataAuthorizedCapital,
    persons,
    dateAndRecordNumber,
    contacts,
    activities,
    ...parseField
  };
};

//-----------------------------

exports.addOrganization = async organization => {
  const org = checkOrganization(organization);
  const result = await connection.one(sql`
    INSERT INTO "Organizations" (status, code,
        manager, capital, phone1, phone2,
        email1, email2, "dateRegistration", "fullName",
        "legalForm", name, address, founders,
        "dataAuthorizedCapital", activity, activities,
        persons, "dateAndRecordNumber", contacts,
        "stayInformation")
      VALUES (${org.status}, ${org.code},
        ${org.manager}, ${org.capital}, ${org.phone1}, ${org.phone2},
        ${org.email1}, ${org.email2}, ${org.dateRegistration}, ${org.fullName},
        ${org.legalForm}, ${org.name}, ${org.address}, ${org.founders},
        ${org.dataAuthorizedCapital}, ${org.activity}, ${org.activities},
        ${org.persons}, ${org.dateAndRecordNumber}, ${org.contacts},
        ${org.stayInformation})
      ON CONFLICT (code) DO UPDATE SET
        status = EXCLUDED.status,
        manager = EXCLUDED.manager,
        capital = EXCLUDED.capital,
        phone1 = EXCLUDED.phone1,
        phone2 = EXCLUDED.phone2,
        email1 = EXCLUDED.email1,
        email2 = EXCLUDED.email2,
        "dateRegistration" = EXCLUDED."dateRegistration",
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
        "stayInformation" = EXCLUDED."stayInformation"
      RETURNING *;
  `);
  return result;
};

//-----------------------------

exports.setStatusOrganization = ({ id, status }) => connection.query(sql`
  UPDATE "Organizations" SET status = ${status} WHERE id = ${id};
`);

//-----------------------------

exports.setOrganization = organization => {
  const org = checkOrganization(organization);

  return connection.query(sql`
    UPDATE "Organizations" SET
      code = ${org.code},
      status = ${org.status},
      manager = ${org.manager},
      capital = ${org.capital},
      phone1 = ${org.phone1},
      phone2 = ${org.phone2},
      email1 = ${org.email1},
      email2 = ${org.email2},
      "dateRegistration" = ${org.dateRegistration}
      "fullName" = ${org.fullName},
      "legalForm" = ${org.legalForm},
      name = ${org.name},
      address = ${org.address},
      founders = ${org.founders},
      "dataAuthorizedCapital" = ${org.dataAuthorizedCapital},
      activity = ${org.activity},
      activities = ${org.activities},
      persons = ${org.persons},
      "dateAndRecordNumber" = ${org.dateAndRecordNumber},
      contacts = ${org.contacts},
      "stayInformation" = ${org.stayInformation}
    WHERE id = ${org.id};
  `);
};

//-----------------------------

exports.checkingForDuplicateEmail = async email => (await connection.one(sql`
  SELECT count(*) < 2 AS exists FROM "Organizations" WHERE email1 = ${email} OR email2 = ${email};
`)).exists;

//-----------------------------

exports.checkingForDuplicatePhone = async phone => (await connection.one(sql`
  SELECT count(*) < 2 AS exists FROM "Organizations" WHERE phone1 = ${phone} OR phone2 = ${phone};
`)).exists;
