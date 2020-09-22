require('dotenv').config();
const { sql } = require('slonik');
const connection = require('./db/db');
const parse = require('./organization/parse');

const getList = async () => (await connection.query(sql`
  SELECT id, contacts, "dataAuthorizedCapital", persons, "dateAndRecordNumber", activities
    FROM "Organizations" where id >= 46000 and "fullName" != '' ORDER BY id;
`)).rows;

const updateDb = async org => connection.query(sql`
  UPDATE "Organizations" SET
    phone1 = ${org.phone1},
    phone2 = ${org.phone2},
    email1 = ${org.email1},
    email2 = ${org.email2}
  WHERE id = ${org.id};
`);

(async () => {
  for (const organization of await getList()) {
    const org = { id: organization.id, ...parse(organization) };
    // await updateDb(org);
    console.info(organization.id);
  }
})();
