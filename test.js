'use strict';

const Client = require('./index');
const credentials = {
  host: 'https://test.examity.com/SmarterServicesapi',
  clientID: "",
  secretKey: ""
};

const client = new Client({});

const examTimePayload = {
  userId: '101',
  timeZone: 78,
  examDate: '06/03/2018',
  examDuration: 10
};

client
// .getToken(credentials)
//   .getTimezone(credentials)
  .listExamTimes(Object.assign({}, credentials, examTimePayload))
  .then(response => {
    console.log(response);
  })
  .catch(err => {
    console.error(err);
  });
