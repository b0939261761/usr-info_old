/* eslint-disable no-underscore-dangle */
const AmoCRM = require('amocrm-js');
const { formatDate } = require('../utils/date');

// ---------------------------------------

module.exports = class {
  constructor() {
    this.responsibleUsers = this.getResponsibleUsers();
  }

  crmOptions = {
    domain: process.env.AMOCRM_DOMAIN,
    auth: {
      login: process.env.AMOCRM_LOGIN,
      hash: process.env.AMOCRM_HASH
    }
  }

  // -------------------------------

  getResponsibleUsers() {
    return Object.keys(process.env)
      .filter(el => el.startsWith('AMOCRM_RESPONSIBLE_USER_ID'))
      .sort()
      .map(el => process.env[el]);
  }
  // -------------------------------

  responsibleUserIndex = 0

  // -------------------------------

  static get tags() {
    return `п_${formatDate('DD.MM.YYYY')}`;
  }

  // -------------------------------

  get companyOptions() {
    return {
      add: [{
        name: this.fullName,
        responsible_user_id: this.responsibleUserId,
        tags: this.constructor.tags
      }]
    };
  }

  // -------------------------------

  get contactOptions() {
    return {
      name: this.organization.manager,
      company_id: this.companyId,
      responsible_user_id: this.responsibleUserId,
      tags: this.constructor.tags,
      custom_fields: [{
        id: 212713,
        values: [{
          value: this.organization.phone1,
          enum: 'WORK'
        },
        {
          value: this.organization.phone2,
          enum: 'WORKDD'
        }]
      },
      {
        id: 212715,
        values: [{
          value: this.organization.email1,
          enum: 'WORK'
        }]
      }]
    };
  }

  // -------------------------------

  getNoteOptions(text, index) {
    return {
      element_id: this.contactId,
      element_type: 1,
      text,
      note_type: 4,
      responsible_user_id: this.responsibleUserId,
      created_at: Math.ceil(Date.now() / 1000) + index
    };
  }

  // -------------------------------

  get notesOptions() {
    const notes = [
      `ЄДРПОУ: ${this.organization.code}`,
      `Адреса: ${this.organization.address}`,
      this.organization.activity,
      `Капітал: ${this.organization.capital}`
    ];

    const { dateRegistration } = this.organization;

    if (dateRegistration) {
      notes.push(`Дата реєстрації: ${formatDate('DD.MM.YYYY', dateRegistration)}`);
    }

    return { add: notes.map(this.getNoteOptions.bind(this)) };
  }

  // -------------------------------

  get leadOptions() {
    return {
      name: this.fullName,
      pipeline_id: 769888, // Base ТОВ
      status_id: 16357765, // 'Первичный контакт',
      responsible_user_id: this.responsibleUserId,
      contacts_id: this.contactId,
      company_id: this.companyId,
      tags: this.constructor.tags
    };
  }

  // -------------------------------

  getResponsibleUserId() {
    console.log('responsibleUserIndex OLD', this.responsibleUserIndex)

    ++this.responsibleUserIndex;
    if (this.responsibleUserIndex === this.responsibleUsers.length) this.responsibleUserIndex = 0;

    console.log('responsibleUserIndex NEW', this.responsibleUserIndex)
    return this.responsibleUsers[this.responsibleUserIndex];
  }

  // -------------------------------
  static throwError(message, request, response) {
    const error = new Error(message);
    error.request = JSON.stringify(request, null, 2);
    error.response = JSON.stringify(response, null, 2);
    throw error;
  }
  // -------------------------------

  async send(organization) {
    this.responsibleUserId = this.getResponsibleUserId();
    console.log('responsibleUserId', this.responsibleUserId);
    this.organization = organization;
    this.fullName = organization.fullName.replace('ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ', 'ТОВ');

    const crm = new AmoCRM(this.crmOptions);
    try {
      await crm.connect();
      const resCompany = await crm.request.post('/api/v2/companies', this.companyOptions);

      if (!resCompany._embedded || !resCompany._embedded.items
        || !resCompany._embedded.items[0] || !resCompany._embedded.items[0].id) {
        this.constructor.throwError('NO_COMPANY', this.companyOptions, resCompany);
      }

      this.companyId = resCompany._embedded.items[0].id;
      const contact = new crm.Contact(this.contactOptions);
      const resContact = await contact.save();
      this.contactId = resContact.id;
      if (!this.contactId) this.constructor.throwError('NO_CONTACT', this.contactOptions, resContact);

      await crm.request.post('/api/v2/notes', this.notesOptions);
      const lead = new crm.Lead(this.leadOptions);
      await lead.save();
    } catch (err) {
      err.message = `AMO_${err.message}`;
      throw err;
    } finally {
      crm.disconnect();
    }
  }
};
