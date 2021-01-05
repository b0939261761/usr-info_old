const { getOrganizationsStream } = require('../db/index.cjs');
const { getDateObj, monthToStr, dayToStr } = require('../utils/date.cjs');

const toStream = require('./toStream.cjs');
const { sendReportMail } = require('../services/mail.cjs');

module.exports = async resDate => {
  const { year, month, day: initDay } = getDateObj(resDate);

  const day = resDate.day ? initDay : 0;
  const streamDb = await getOrganizationsStream({ year, month, day });

  const monthStr = monthToStr(month);
  const dayStr = dayToStr(day);

  const fileName = `usrinfo-${year}-${monthStr}${day ? `-${dayStr}` : ''}`;
  const subject = `📜 Отчет за ${day ? `${dayStr}.` : ''}${monthStr}.${year}`;
  const attachments = {
    filename: `${fileName}.zip`,
    content: toStream(fileName, streamDb)
  };
  await sendReportMail({ subject, attachments });
};
