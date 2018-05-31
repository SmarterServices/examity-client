'use strict';

const Client = require('./index');

const client = new Client({
  host: 'https://test.examity.com/SmarterServicesapi'
});

client
  .getToken({
  })
  .then(response => {
    console.log(response);
  })
  .catch(err => {
    console.error(err);
  });
