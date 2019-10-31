const knex = require('knex');

const database = knex({
  client: 'pg', // pg is the database library for postgreSQL on knexjs
  connection: {
    host: 'localhost', // Your local host IP
    user: '6k3vddrb2v', // Your postgres user name
    password: 'your_password', // Your postgres user password
    database: 'simple_api' // Your database name
  }
});

module.exports = database;
