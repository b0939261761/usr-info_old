const { sql } = require('slonik');
const connection = require('./db');
const parse = require('../organization/parse');

//-----------------------------

exports.getOrganizations = async (where = {}) => {
  const createWhereFragment = ({
    status, year, month, day
  }) => {
    if (year && month && day && status) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        AND EXTRACT(MONTH FROM "createdAt") = ${month}
        AND EXTRACT(DAY FROM "createdAt") = ${day}
        AND status = ${status}`;
    }

    if (year && month && status) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        AND EXTRACT(MONTH FROM "createdAt") = ${month}
        AND status = ${status}`;
    }

    if (year && status) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        AND status = ${status}`;
    }

    if (status) {
      return sql`status = ${status}`;
    }

    if (year && month && day && status) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        AND EXTRACT(MONTH FROM "createdAt") = ${month}
        AND EXTRACT(DAY FROM "createdAt") = ${day}`;
    }

    if (year && month) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        AND EXTRACT(MONTH FROM "createdAt") = ${month}`;
    }

    if (year) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}`;
    }

    return sql``;
  };

  return (await connection.query(sql`
    SELECT * FROM "Organizations" ${createWhereFragment(where)} ORDER BY code;
  `)).rows;
};

//-----------------------------

exports.getOrganizationsStream = (where = {}) => {
  const createWhereFragment = ({
    status, year, month, day
  }) => {
    if (year && month && day && status) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        AND EXTRACT(MONTH FROM "createdAt") = ${month}
        AND EXTRACT(DAY FROM "createdAt") = ${day}
        AND status = ${status}`;
    }

    if (year && month && status) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        AND EXTRACT(MONTH FROM "createdAt") = ${month}
        AND status = ${status}`;
    }

    if (year && status) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        AND status = ${status}`;
    }

    if (status) {
      return sql`status = ${status}`;
    }

    if (year && month && day && status) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        AND EXTRACT(MONTH FROM "createdAt") = ${month}
        AND EXTRACT(DAY FROM "createdAt") = ${day}`;
    }

    if (year && month) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        AND EXTRACT(MONTH FROM "createdAt") = ${month}`;
    }

    if (year) {
      return sql`WHERE EXTRACT(YEAR FROM "createdAt") = ${year}`;
    }

    return sql``;
  };

  return new Promise(resolve => connection.stream(
    sql`SELECT * FROM "Organizations" ${createWhereFragment(where)} ORDER BY code LIMIT 3`,
    stream => resolve(stream)
  ));
};

//-----------------------------

const checkOrganization = organization => {
  const {
    dataAuthorizedCapital = '',
    persons = '',
    dateAndRecordNumber = '',
    contacts = ''
  } = organization;

  const parseField = parse({
    contacts, dataAuthorizedCapital, persons, dateAndRecordNumber
  });

  return {
    code: organization.code || '',
    status: organization.status || 'none',
    fullName: organization.fullName || '',
    legalForm: organization.code || '',
    name: organization.name || '',
    address: organization.address || '',
    founders: organization.founders || '',
    activity: organization.activity || '',
    activities: organization.activities || '',
    stayInformation: organization.stayInformation || '',
    ...parseField
  };
};

//-----------------------------

exports.addOrganization = organization => {
  const org = checkOrganization(organization);

  connection.query(sql`
    INSERT INTO "Organizations" (status, code,
        manager, capital, phone1, phone2,
        email, "dateRegistration", "fullName",
        "legalForm", name, address, founders,
        "dataAuthorizedCapital", activity, activities,
        persons, "dateAndRecordNumber", contacts,
        "stayInformation")
      VALUES (${org.status}, ${org.code},
        ${org.manager}, ${org.capital}, ${org.phone1}, ${org.phone2},
        ${org.email}, ${org.email}, ${org.dateRegistration}, ${org.fullName},
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
        email = EXCLUDED.email,
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
        "stayInformation" = EXCLUDED."stayInformation";
  `);
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
      email = ${org.email},
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
