const { promises: fs } = require('fs');
const { getOrganizationsStream } = require('../db');
const { getDateObj, monthToStr, dayToStr } = require('../utils/date');

const toCreateFile = require('./toCreateFile');
const { sendReportMail } = require('../services/mail');

module.exports = async resDate => {
  const { year, month, day: initDay } = getDateObj(resDate);

  const day = resDate.day ? initDay : 0;
  const streamDb = await getOrganizationsStream({ year, month, day });

  const monthStr = monthToStr(month);
  const dayStr = dayToStr(day);

  const fileName = `usrinfo-${year}-${monthStr}${day ? `-${dayStr}` : ''}`;
  const subject = `📜 Отчет за ${day ? `${dayStr}.` : ''}${monthStr}.${year}`;

  const path = await toCreateFile(fileName, streamDb);
  await sendReportMail({ path, subject });
  await fs.unlink(path);
};
