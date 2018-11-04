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
  examId: '103',
  examName: 'Sample Quiz',
  examURL: 'http://www.proprofs.com',
  examDuration: 30,
  examPassword: 'S@mp!e31024567',
  timeZone: 78,
  examDate: '2018-12-12T06:00:00Z',
  examInstruction: 'Rule1',
  examLevel: '1'
};

const getUserProfilePayload = {
  userId: '101'
};
const getExamStatusPayload = {
  transactionId: 990010193
};

client
// .getToken(credentials)
// .getTimezone(credentials)
// .listUserExam(Object.assign({}, credentials, listUserPayload))
// .listExamTimes(Object.assign({}, credentials, examTimePayload))
// .listCourseExam(Object.assign({}, credentials, listCoursePayload))
// .scheduleAppointment(Object.assign({}, credentials, schedulePayload, {courseInfo, examInfo}))
// .rescheduleAppointment(Object.assign({}, credentials, {courseInfo, examInfo, transactionId: 990000015}))
// .cancelAppointment(Object.assign({}, credentials, {transactionId: 990000015}))
// .getUserProfile(Object.assign({}, credentials, getUserProfilePayload))
 .getExamStatus(Object.assign({}, credentials, getExamStatusPayload))
  .then(response => {
    console.log(JSON.stringify(response, null, 2));
  })
  .catch(err => {
    console.error(err);
  });
