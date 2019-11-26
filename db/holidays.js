const { sql } = require('slonik');
const connection = require('./db');

//-----------------------------

exports.existsHoliday = async date => (await connection.one(sql`
  SELECT EXISTS(SELECT 1 FROM "Holidays" WHERE date = ${date}) AS exists;
`)).exists;

//-----------------------------

exports.getHolidays = async date => (await connection.query(sql`
  SELECT id, date FROM "Holidays" WHERE date >= ${date} ORDER BY date
`)).rows;

//-----------------------------

exports.addHolidays = dates => connection.query(sql`
  INSERT INTO "Holidays" (date)
    SELECT date FROM
      ${sql.unnest([...dates.map(el => [el])], ['date'])}
      AS tmp(date)
    ON CONFLICT (date) DO NOTHING;
`);
