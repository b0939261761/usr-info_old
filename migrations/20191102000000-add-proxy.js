const tableName = 'Proxies';

module.exports = {
  up: knex => knex.raw(`
    CREATE TABLE "${tableName}" (
      id SERIAL PRIMARY KEY,
      server VARCHAR(21) NOT NULL DEFAULT '' UNIQUE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      "lastActive" TIMESTAMP WITH TIME ZONE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER "${tableName}UpdateAt"
      BEFORE UPDATE ON "${tableName}"
        FOR EACH ROW EXECUTE PROCEDURE "updateAtTimestamp"();
  `),
  down: knex => knex.raw(`DROP TABLE IF EXISTS "${tableName}";`)
};
