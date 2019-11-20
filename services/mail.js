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
    html: `<pre>${error.stack}</pre><pre>${JSON.stringify(error, null, 2)}</pre>`
  };

  try {
    await sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
};

exports.sendReportMail = async ({ subject, path }) => {
  const mailOptions = {
    ...mailOptionsDefault,
    to: `${process.env.SUPPORT_EMAIL},${process.env.CLIENT_EMAIL}`,
    subject,
    attachments: {
      path
    }
  };

  try {
    await sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
};
