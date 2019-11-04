const nodemailer = require('nodemailer');
const { formatDateTime } = require('../utils/tools');

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

exports.sendErrorMail = async error => {
  const mailOptions = {
    ...mailOptionsDefault,
    subject: `🛑 Error [${formatDateTime(new Date())}]: ${error.message.slice(0, 20)}`,
    html: `<pre>${error.stack}</pre>`
  };

  try {
    const transporter = nodemailer.createTransport(transportOptions);
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
};
