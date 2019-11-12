const tableName = 'Organizations';
const typeName = `${tableName}Status`;

module.exports = {
  up: knex => knex.raw(`
    CREATE TYPE "${typeName}" AS ENUM ('invalid', 'unsuitable', 'suitable', 'send');

    COMMENT ON TYPE "${typeName}" IS 'Статус записи';

    CREATE TABLE "${tableName}" (
      id SERIAL PRIMARY KEY,
      "status" "${typeName}" NULL DEFAULT 'unsuitable',
      code VARCHAR(8) NOT NULL DEFAULT '' UNIQUE,
      "fullName" TEXT NOT NULL DEFAULT '',
      "legalForm" TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      founders TEXT NOT NULL DEFAULT '',
      "dataAuthorizedCapital" TEXT NOT NULL DEFAULT '',
      activity TEXT NOT NULL DEFAULT '',
      activities TEXT NOT NULL DEFAULT '',
      persons TEXT NOT NULL DEFAULT '',
      "dateAndRecordNumber" TEXT NOT NULL DEFAULT '',
      contacts TEXT NOT NULL DEFAULT '',
      "stayInformation" TEXT NOT NULL DEFAULT '',
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    COMMENT ON table "${tableName}"  IS 'Организации';

    COMMENT ON COLUMN "${tableName}".id IS 'Уникальный идентификатор';
    COMMENT ON COLUMN "${tableName}".status IS 'Статус записи';
    COMMENT ON COLUMN "${tableName}".code IS 'Ідентифікаційний код юридичної особи';
    COMMENT ON COLUMN "${tableName}"."fullName" IS 'Повне найменування юридичної особи та скорочене у разі його наявності';
    COMMENT ON COLUMN "${tableName}"."legalForm" IS 'Організаційно-правова форма';
    COMMENT ON COLUMN "${tableName}".name IS 'Назва юридичної особи';
    COMMENT ON COLUMN "${tableName}".address IS 'Місце знаходження юридичної особи';
    COMMENT ON COLUMN "${tableName}".founders IS 'Перелік засновників (учасників) юридичної особи';
    COMMENT ON COLUMN "${tableName}"."dataAuthorizedCapital" IS 'Дані про розмір статутного капіталу';
    COMMENT ON COLUMN "${tableName}".activity IS 'Вид діяльності';
    COMMENT ON COLUMN "${tableName}".activities IS 'Види діяльності';
    COMMENT ON COLUMN "${tableName}".persons IS 'Прізвище, ім"я, по батькові, дата обрання осіб, які обираються до органу управління юридичної особи';
    COMMENT ON COLUMN "${tableName}"."dateAndRecordNumber" IS 'Дата та номер запису в Єдиному державному реєстрі про проведення державної реєстрації юридичної особи';
    COMMENT ON COLUMN "${tableName}".contacts IS 'Інформація про здійснення зв"язку з юридичною особою';
    COMMENT ON COLUMN "${tableName}"."stayInformation" IS 'Дані про перебування юридичної особи у процесі припинення';
    COMMENT ON COLUMN "${tableName}"."createdAt" IS 'Дата создания записи';
    COMMENT ON COLUMN "${tableName}"."updatedAt" IS 'Дата обновления записи';

    CREATE TRIGGER "${tableName}UpdateAt"
      BEFORE UPDATE ON "${tableName}"
        FOR EACH ROW EXECUTE PROCEDURE "updateAtTimestamp"();

    COMMENT ON TRIGGER "${tableName}UpdateAt" ON "${tableName}" IS 'Изменение даты обновления записи';
  `),
  down: knex => knex.raw(`
    DROP TABLE IF EXISTS "${tableName}";
    DROP TYPE IF EXISTS "${typeName}";
  `)
};
