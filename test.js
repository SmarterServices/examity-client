'use strict';

const Client = require('./index');
const credentials = {
  host: 'https://test.examity.com/SmarterServicesapi',
  clientID: '',
  secretKey: ''
};

const client = new Client({});

const listCoursePayload = {
  courseId: 'SamepleCourse_101',
  userId: '101',
  pagenum: 1
};
const listUserPayload = {
  courseId: 'SamepleCourse_101',
  userId: '101',
  pagenum: 1
};
const examTimePayload = {
  userId: '101',
  timeZone: 78,
  examDate: '06/03/2018',
  examDuration: 10
};

client
// .getToken(credentials)
//   .getTimezone(credentials)
//   .listUserExam(Object.assign({}, credentials, listUserPayload))
 .listExamTimes(Object.assign({}, credentials, examTimePayload))
//   .listCourseExam(Object.assign({}, credentials, listCoursePayload))
  .then(response => {
    console.log(response);
  })
  .catch(err => {
    console.error(err);
  });
