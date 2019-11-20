/* eslint-disable no-underscore-dangle */
const AmoCRM = require('amocrm-js');
const { formatDate } = require('../utils/date');

// ---------------------------------------

module.exports = class {
  crmOptions = {
    domain: process.env.AMOCRM_DOMAIN,
    auth: {
      login: process.env.AMOCRM_LOGIN,
      hash: process.env.AMOCRM_HASH
    }
  }

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
          value: this.organization.email,
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
      `Капітал: ${this.organization.capital}`,
      `Дата реєстрації: ${this.organization.dateRegistration}`
    ];

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
    return this.responsibleUserId === process.env.AMOCRM_RESPONSIBLE_USER_ID1
      ? process.env.AMOCRM_RESPONSIBLE_USER_ID2
      : process.env.AMOCRM_RESPONSIBLE_USER_ID1;
  }

  // -------------------------------
  static throwError(message, response) {
    const error = new Error(message);
    error.response = response;
    throw error;
  }
  // -------------------------------

  async send(organization) {
    this.responsibleUserId = this.getResponsibleUserId();
    this.organization = organization;
    this.fullName = organization.fullName.replace('ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ', 'ТОВ');

    const crm = new AmoCRM(this.crmOptions);
    try {
      await crm.connect();
      const resCompany = await crm.request.post('/api/v2/companies', this.companyOptions);
      if (!resCompany._embedded || !resCompany._embedded.items) {
        this.constructor.throwError('NO_COMPANY', resCompany);
      }

      this.companyId = resCompany._embedded.items[0].id;
      const contact = new crm.Contact(this.contactOptions);
      const resContact = await contact.save();
      this.contactId = resContact.id;
      if (!this.contactId) this.constructor.throwError('NO_CONTACT', resContact);

      await crm.request.post('/api/v2/notes', this.notesOptions);
      const lead = new crm.Lead(this.leadOptions);
      await lead.save();
    } catch (err) {
      const error = new Error(`AMO_${err.message}`);
      error.response = err.response;
      throw error;
    } finally {
      crm.disconnect();
    }
  }
};
