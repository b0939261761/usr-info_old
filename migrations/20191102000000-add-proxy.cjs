const tableName = 'Proxies';

module.exports = {
  up: knex => knex.raw(`
    CREATE TABLE "${tableName}" (
      id SERIAL PRIMARY KEY,
      server VARCHAR(21) NOT NULL DEFAULT '' UNIQUE,
      "amountErrors" INTEGER NOT NULL DEFAULT 0,
      "lastActive" TIMESTAMP WITH TIME ZONE,
      protocol varchar(5) NOT NULL DEFAULT '';
      username VARCHAR(100) NOT NULL DEFAULT '',
      password VARCHAR(100) NOT NULL DEFAULT '',
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    COMMENT ON COLUMN "${tableName}".protocol IS 'Протокол';
    COMMENT ON COLUMN "${tableName}".username IS 'Пользователь';
    COMMENT ON COLUMN "${tableName}".password IS 'Пароль';

    CREATE TRIGGER "${tableName}UpdateAt"
      BEFORE UPDATE ON "${tableName}"
        FOR EACH ROW EXECUTE PROCEDURE "updateAtTimestamp"();
  `),
  down: knex => knex.raw(`DROP TABLE IF EXISTS "${tableName}";`)
};
