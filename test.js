'use strict';

const Client = require('./index');
const credentials = {
  host: 'https://test.examity.com/SmarterServicesapi',
  clientID: '',
  secretKey: '',
  courseId: 'SamepleCourse_101',
  pagenum: 1
};

const client = new Client({});

client
  // .getToken(credentials)
  .listCourseExam(credentials)
  .then(response => {
    console.log(response);
  })
  .catch(err => {
    console.error(err);
  });
