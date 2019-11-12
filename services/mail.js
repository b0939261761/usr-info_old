const nodemailer = require('nodemailer');
const { formatDate } = require('../utils/date');

const transportOptions = {
  host: 'smtp.googlemail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD
  }
};

const mailOptionsDefault = {
  from: `'Usrinfo Grabber' <${process.env.GMAIL_USERNAME}>`,
  to: `${process.env.SUPPORT_EMAIL}`
};

const sendMail = mailOptions => {
  const transporter = nodemailer.createTransport(transportOptions);
  return transporter.sendMail(mailOptions);
};

exports.sendErrorMail = async error => {
  const mailOptions = {
    ...mailOptionsDefault,
    subject: `🛑 ERROR [${formatDate('DD.MM.YY HH:mm:ss')}]: ${error.message.slice(0, 30)}`,
    html: `<pre>${error.stack}</pre>`
  };

  try {
    await sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
};

exports.sendReportMail = async ({ date, content }) => {
  const mailOptions = {
    ...mailOptionsDefault,
    to: `${process.env.SUPPORT_EMAIL},${process.env.CLIENT_EMAIL}`,
    subject: `🛑 Отчет за ${formatDate('DD.MM.YY', date)}`,
    attachments: {
      filename: `report-${formatDate('YYYY-MM-DD', date)}.csv`,
      content
    }
  };

  try {
    await sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
};
