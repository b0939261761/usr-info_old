const tableName = 'Holidays';

module.exports = {
  up: knex => knex.raw(`
    CREATE TABLE "${tableName}" (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    COMMENT ON table "${tableName}"  IS 'Выходные дни';
    COMMENT ON COLUMN "${tableName}".id IS 'Уникальный идентификатор';
    COMMENT ON COLUMN "${tableName}".date IS 'Дата';
    COMMENT ON COLUMN "${tableName}"."createdAt" IS 'Дата создания записи';
    COMMENT ON COLUMN "${tableName}"."updatedAt" IS 'Дата обновления записи';

    CREATE TRIGGER "${tableName}UpdateAt"
      BEFORE UPDATE ON "${tableName}"
        FOR EACH ROW EXECUTE PROCEDURE "updateAtTimestamp"();

    COMMENT ON TRIGGER "${tableName}UpdateAt" ON "${tableName}" IS 'Изменение даты обновления записи';
  `),
  down: knex => knex.raw(`DROP TABLE IF EXISTS "${tableName}";`)
};
