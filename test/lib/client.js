'use strict';

const nock = require('nock');
const Client = require('./../../index');
const examityData = require('../data/examity.json');
const expect = require('chai').expect;
const examityMock = require('./mock');

describe('Client', function testClient() {
  const config = examityData.config;
  let client;

  before('Mock', function () {
    nock.disableNetConnect();
  });

  after('Mock', function () {
    nock.enableNetConnect();
    examityMock.reset();
  });

  it('Should create new client', function testCreateNewClient() {
    client = new Client(config);
    expect(client).instanceof(Client);
  });

  describe('Get Token', function testClient() {

    const payload = examityData.getToken.payload;

    before('Create Mocker', function () {
      examityMock.postEndpointMocker('getToken');
    });

    it('Should list token', () => {
      return client
        .getToken(payload)
        .then((response) => {
          expect(response).to.eql(examityData.getToken.response.valid.authInfo.access_token);
        });
    });

  });

  describe('Get Timezone', function testClient() {

    const payload = examityData.getToken.payload;

    before('Create Mocker', function () {
      examityMock.getEndpointMocker('getTimezone');
    });

    it('Should list timezone', () => {
      return client
        .getTimezone(payload)
        .then((response) => {
          expect(response).to.eql(examityData.getTimezone.response.valid);
        });
    });

    it('Should fail to list timezone', () => {
      examityMock.reset();
      examityMock.postEndpointMocker('getToken');
      examityMock.getEndpointMocker('getTimezone', 'INTERNAL_SERVER_ERROR', 500);
      return client
        .getTimezone(payload)
        .then(Promise.reject.bind(Promise))
        .catch((error) => {
          expect(error.statusCode).to.eql(500);
          expect(error.error.message).to.eql(examityData.getTimezone.response.INTERNAL_SERVER_ERROR.message);
        });
    });

  });

  describe('List Exam Under Course', function testClient() {

    const payload = examityData.listCourseExam.payload;


    it('Should list exam under course', () => {
      examityMock.postEndpointMocker('getToken');
      examityMock.getEndpointMocker('listCourseExam', 'valid', 200, payload);

      return client
        .listCourseExam(payload)
        .then((response) => {
          expect(response).to.eql(examityData.listCourseExam.response.valid);

          examityMock.reset();
        });
    });

    it('Should fail to list exam under course for error response from examity', () => {
      examityMock.postEndpointMocker('getToken');
      examityMock.getEndpointMocker('listCourseExam', 'INTERNAL_SERVER_ERROR', 500, payload);
      return client
        .listCourseExam(payload)
        .catch((error) => {
          expect(error.statusCode).to.eql(500);
          expect(error.error.message).to.eql(examityData.getTimezone.response.INTERNAL_SERVER_ERROR.message);

          examityMock.reset();
        });
    });

  });

  describe('List Exam Times', function testClient() {

    const payload = Object.assign({}, examityData.getToken.payload, examityData.listExamTimes.payload.valid);

    before('Create Mocker', function () {
      examityMock.postEndpointMocker('listExamTimes');
      examityMock.postEndpointMocker('getToken');
    });

    it('Should list timezone', () => {
      return client
        .listExamTimes(payload)
        .then((response)=>{
          expect(response).to.eql(examityData.listExamTimes.response.valid);
        });
    });

    it('Should fail to list timezone', () => {
      examityMock.reset();
      examityMock.postEndpointMocker('getToken');
      examityMock.postEndpointMocker('listExamTimes', 'UNAVAILABLE_INFORMATION');
      return client
        .listExamTimes(payload)
        .then(Promise.reject.bind(Promise))
        .catch((error)=>{
          expect(error.statusCode).to.eql(examityData.listExamTimes.response.UNAVAILABLE_INFORMATION.statusCode);
          expect(error.message).to.eql(examityData.listExamTimes.response.UNAVAILABLE_INFORMATION.message);
        });
    });

  });

  describe('Schedule Appointment', function testClient() {

    const apiName = 'scheduleAppointment';
    const payload = Object.assign({}, examityData.getToken.payload, examityData[apiName].payload.valid);

    before('Create Mocker', function () {
      examityMock.postEndpointMocker(apiName);
    });

    it('Should schedule appointment', () => {
      return client
        .scheduleAppointment(payload)
        .then((response)=>{
          expect(response).to.eql(examityData[apiName].response.valid);
        });
    });

    it('Should fail to schedule Appointment', () => {
      examityMock.reset();
      examityMock.postEndpointMocker('getToken');
      examityMock.postEndpointMocker(apiName, 'ALREADY_SCHEDULED');
      return client
        .scheduleAppointment(payload)
        .then(Promise.reject.bind(Promise))
        .catch((error)=>{
          expect(error.statusCode).to.eql(examityData[apiName].response.ALREADY_SCHEDULED.statusCode);
          expect(error.message).to.eql(examityData[apiName].response.ALREADY_SCHEDULED.message);
        });
    });

  });

  describe('Reschedule Appointment', function testClient() {

    const apiName = 'rescheduleAppointment';
    const payload = Object.assign({}, examityData.getToken.payload, examityData[apiName].payload.valid);

    before('Create Mocker', function () {
      examityMock.putEndpointMocker(apiName);
    });

    it('Should reschedule appointment', () => {
      return client
        .rescheduleAppointment(payload)
        .then((response)=>{
          expect(response).to.eql(examityData[apiName].response.valid);
        });
    });

    it('Should fail to reschedule appointment', () => {
      examityMock.reset();
      examityMock.postEndpointMocker('getToken');
      examityMock.putEndpointMocker(apiName, 'NOT_ALLOWED');
      return client
        .rescheduleAppointment(payload)
        .then(Promise.reject.bind(Promise))
        .catch((error)=>{
          expect(error.statusCode).to.eql(examityData[apiName].response.NOT_ALLOWED.statusCode);
          expect(error.message).to.eql(examityData[apiName].response.NOT_ALLOWED.message);
        });
    });

  });

  describe('List Exam Under User', function testClient() {

    const payload = examityData.listUserExam.payload;


    it('Should list exam under user', () => {
      examityMock.postEndpointMocker('getToken');
      examityMock.postEndpointMocker('listUserExam', 'valid', payload);

      return client
        .listUserExam(payload)
        .then((response) => {
          expect(response).to.eql(examityData.listCourseExam.response.valid);

          examityMock.reset();
        });
    });

    it('Should fail to list exam under user for error response from examity', () => {
      examityMock.postEndpointMocker('getToken');
      examityMock.postEndpointMocker('listUserExam', 'INTERNAL_SERVER_ERROR', payload);
      return client
        .listUserExam(payload)
        .catch((error) => {
          expect(error.statusCode).to.eql(500);
          expect(error.message).to.eql(examityData.listUserExam.response.INTERNAL_SERVER_ERROR.message);

          examityMock.reset();
        });
    });

  });


  describe('Cancel Appointment', function testClient() {

    const payload = examityData.cancelAppointment.payload;


    it('Should cancel appointment under exam', () => {
      examityMock.postEndpointMocker('getToken');
      examityMock.deleteEndpointMocker('cancelAppointment', 'valid', payload);

      return client
        .cancelAppointment(payload)
        .then((response) => {
          expect(response).to.eql(examityData.cancelAppointment.response.valid);

          examityMock.reset();
        });
    });

    it('Should fail to cancel appointment for error response from examity', () => {
      examityMock.postEndpointMocker('getToken');
      examityMock.deleteEndpointMocker('cancelAppointment', 'INTERNAL_SERVER_ERROR', payload);
      return client
        .cancelAppointment(payload)
        .catch((error) => {
          expect(error.statusCode).to.eql(500);
          expect(error.message).to.eql(examityData.listUserExam.response.INTERNAL_SERVER_ERROR.message);

          examityMock.reset();
        });
    });

  });

  describe('Start Exam', function testClient() {

    const payload = examityData.startExam.payload;
    const htmlBody = `<html lang="en">
    <head>
    </head>
    <body>
      <form name="login" method="Post" action="https://test.examity.com/smarterservices/login.aspx">
        <input name="UserName" type="hidden" value="wOqEKbPR/BTuKb2U11N7BGPDca7G+qhuWOD8OcpBjAKu97Mhv3tVYquYvcJhaTp1"> 
      </form>
    </body>
    <script type="text/javascript">
        window.onload=function(){
            document.forms["login"].submit();
        }
    </script>
</html>`;


    it('Should get [HTMLBody] for start exam request', () => {

      return client
        .getStartExamSSORequest(payload)
        .then((response) => {
          expect(response.htmlBody).to.eql(htmlBody);
        });
    });

  });

  describe('Review Exam', function testClient() {

    const payload = examityData.reviewExam.payload;
    const url = 'http://test.examity.com/smarterservices/ViewExam.aspx?Transid=BtQF87fvoZSWm4vLCDORIw==';


    it('Should get [HTMLBody] for start exam request', () => {

      return client
        .getReviewExamSSORequest(payload)
        .then((response) => {
          expect(response.url).to.eql(url);
        });
    });

  });

  describe('Get User Profile', function testClient() {

    const payload = examityData.getUserProfile.payload;

    before('Create Mocker', function () {
      examityMock.postEndpointMocker('getToken');
      examityMock.getEndpointMocker('getUserProfile', 'valid', 200, {userId: payload.userId});
    });

    it('Should get the user profile information', () => {
      return client
        .getUserProfile(payload)
        .then((response)=>{
          expect(response).to.eql(examityData.getUserProfile.response.valid);
        });
    });

    it('Should fail to get user profile information for internal server error', () => {
      examityMock.reset();
      examityMock.postEndpointMocker('getToken');
      examityMock.getEndpointMocker('getUserProfile', 'INTERNAL_SERVER_ERROR', 500, {userId: payload.userId});
      return client
        .getUserProfile(payload)
        .then(Promise.reject.bind(Promise))
        .catch((error)=>{
          expect(error.statusCode).to.eql(examityData.getUserProfile.response.INTERNAL_SERVER_ERROR.statusCode);
          expect(error.error.message).to.eql(examityData.getUserProfile.response.INTERNAL_SERVER_ERROR.message);
        });
    });

    it('Should fail to get user profile information for invalid access token', () => {
      examityMock.reset();
      examityMock.postEndpointMocker('getToken');
      examityMock.getEndpointMocker('getUserProfile', 'INVALID_ACCESS_TOKEN', 401, {userId: payload.userId});
      return client
        .getUserProfile(payload)
        .then(Promise.reject.bind(Promise))
        .catch((error)=>{
          expect(error.statusCode).to.eql(examityData.getUserProfile.response.INVALID_ACCESS_TOKEN.statusCode);
          expect(error.error.message).to.eql(examityData.getUserProfile.response.INVALID_ACCESS_TOKEN.message);
        });
    });

    it('Should fail to get user profile information for no authorization header', () => {
      examityMock.reset();
      examityMock.postEndpointMocker('getToken');
      examityMock.getEndpointMocker('getUserProfile', 'AUTHORIZATION_HEADER_NEEDED', 402, {userId: payload.userId});
      return client
        .getUserProfile(payload)
        .then(Promise.reject.bind(Promise))
        .catch((error)=>{
          expect(error.statusCode).to.eql(examityData.getUserProfile.response.AUTHORIZATION_HEADER_NEEDED.statusCode);
          expect(error.error.message).to.eql(examityData.getUserProfile.response.AUTHORIZATION_HEADER_NEEDED.message);
        });
    });

  });

});
