'use strict';

const Client = require('./index');
const credentials = {
  host: 'https://test.examity.com/SmarterServicesapi',
  clientID: "",
  secretKey: ""
};

const client = new Client({});

client
  // .getToken(credentials)
  .getTimezone(credentials)
  .then(response => {
    console.log(response);
  })
  .catch(err => {
    console.error(err);
  });
