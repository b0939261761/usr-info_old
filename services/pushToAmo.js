const organization = {};

// импорт_парсер_дата

const dd = {
  add: [{
    name: organization.manager,
    company_name: organization.fullName,
    responsible_user_id: '504141',
    created_by: '504141',
    created_at: Date.now(),
    tags: '',
    leads_id: [
      '45615',
      '43510'
    ],
    company_id: '30615',
    custom_fields: [{
      id: '4396817',
      values: [{
        value: 'Менеджер по продажам'
      }]
    },
    {
      id: '4396818',
      values: [{
        value: organization.phone1,
        enum: 'WORK'
      },
      {
        value: organization.phone2,
        enum: 'WORKDD'
      }]
    },
    {
      id: '4396819',
      values: [{
        value: organization.email,
        enum: 'WORK'
      }]
    },
    {
      id: '4400116',
      values: [
        '3692662',
        '3692663'
      ]
    }
    ]
  }]
};
