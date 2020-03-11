const mysql = require('mysql2/promise');
const { formatDate, addDays } = require('../utils/date');

const options = {
  host: process.env.TURBOSMS_DB_HOST,
  user: process.env.TURBOSMS_DB_USER,
  password: process.env.TURBOSMS_DB_PASSWORD,
  database: process.env.TURBOSMS_DB_DATABASE
};

const getSendTime = () => {
  let time;
  const dateNow = new Date();
  const hourNow = dateNow.getHours();
  if (hourNow < 8) time = dateNow;
  else if (hourNow > 18) time = addDays(1, dateNow);

  return time ? formatDate('YYYY-MM-DD 09:00:00.0', time) : '';
};

const getSql = ({ phone, sendTime }) => `
  INSERT INTO ${process.env.TURBOSMS_DB_USER}
    (number, sign, message, send_time)
      VALUES
    ('${phone}', '${process.env.COMPANY_SIGN}', '${process.env.TURBOSMS_MESSAGE}', '${sendTime}');
`;

module.exports = async phone => {
  const sendTime = getSendTime();
  const sql = getSql({ phone, sendTime });

  try {
    const connection = await mysql.createConnection(options);
    await connection.query(sql);
    await connection.end();
  } catch (err) {
    console.error(err);
  }
};
