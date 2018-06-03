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
  }
};
const courseInfo = {
  courseId: 'SamepleCourse_101',
  courseName: 'Sample Course'
};
const examInfo = {
  examId: '102',
  examName: 'Sample Quiz',
  examURL: 'http://www.proprofs.com',
  examDuration: 30,
  examPassword: 'S@mp!e31024567',
  timeZone: 78,
  examDate: '2018-06-07T06:00:00Z',
  examInstruction: 'Rule1',
  examLevel: '1'
};

client
// .getToken(credentials)
//   .getTimezone(credentials)
//   .listExamTimes(Object.assign({}, credentials, examTimePayload))
  .scheduleAppointment(Object.assign({}, credentials, schedulePayload, {courseInfo, examInfo}))
  .then(response => {
    console.log(JSON.stringify(response, null, 2));

  })
  .catch(err => {
    console.error(err);
  });
