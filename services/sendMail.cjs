const sgMail = require('@sendgrid/mail');

const options = {
  from: `'${process.env.COMPANY_SIGN}' <${process.env.SENDGRID_EMAIL_FROM}>`,
  templateId: process.env.SENDGRID_TEMPLATE_ID,
  hideWarnings: process.env.NODE_ENV === 'production'
};

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async ({ email, manager, company }) => {
  const msg = {
    ...options,
    to: email,
    dynamic_template_data: {
      manager,
      company
    }
  };

  try {
    await sgMail.send(msg);
  } catch (err) {
    console.error(err.toString());
  }
};
