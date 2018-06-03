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
  examDate: '06/02/2018',
  examDuration: 10
};

const schedulePayload = {
  userInfo: {
    userId: '101',
    firstName: 'Sample',
    lastName: 'User',
    emailAddress: 'sample_user@example.com'
  },
  courseInfo: {
    courseId: 'SamepleCourse_101',
    courseName: 'Sample Course'
  },
  examInfo: {
    examId: '101',
    examName: 'Sample Quiz',
    examURL: 'http://www.proprofs.com',
    examDuration: 30,
    examPassword: 'S@mp!e31024567',
    timeZone: 78,
    examDate: '2018-06-05T06:00:00Z',
    examInstruction: 'Rule1',
    examLevel: '1'
  }
};

client
// .getToken(credentials)
//   .getTimezone(credentials)
//   .listExamTimes(Object.assign({}, credentials, examTimePayload))
  .schedule(Object.assign({}, credentials, schedulePayload))
  .then(response => {
    console.log(response);
  })
  .catch(err => {
    console.error(err);
  });
