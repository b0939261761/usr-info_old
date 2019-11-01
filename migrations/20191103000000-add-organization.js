const tableName = 'Organization';

module.exports = {
  up: knex => knex.raw(`
    CREATE TABLE "${tableName}" (
      id SERIAL PRIMARY KEY,
      code VARCHAR(9) NOT NULL DEFAULT '' UNIQUE,
      "captchaId" BIGINT NOT NULL DEFAULT 0,
      "fullName" TEXT NOT NULL DEFAULT '',
      "fullNameEn" TEXT NOT NULL DEFAULT '',
      "address" TEXT NOT NULL DEFAULT '',
      "phone" TEXT NOT NULL DEFAULT '',
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER "${tableName}UpdateAt"
      BEFORE UPDATE ON "${tableName}"
        FOR EACH ROW EXECUTE PROCEDURE "updateAtTimestamp"();
  `),
  down: knex => knex.raw(`DROP TABLE IF EXISTS "${tableName}";`)
};
