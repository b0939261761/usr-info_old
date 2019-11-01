const tableName = 'Organization';

module.exports = {
  up: knex => knex.raw(`
    CREATE TABLE "${tableName}" (
      id SERIAL PRIMARY KEY,
      code VARCHAR(9) NOT NULL DEFAULT '' UNIQUE,
      "fullName" TEXT NOT NULL DEFAULT '',
      person TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      "isSent" BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER "${tableName}UpdateAt"
      BEFORE UPDATE ON "${tableName}"
        FOR EACH ROW EXECUTE PROCEDURE "updateAtTimestamp"();
  `),
  down: knex => knex.raw(`DROP TABLE IF EXISTS "${tableName}";`)
};
