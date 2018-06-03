'use strict';

const joi = require('joi');
const utils = require('./../lib/helpers/utils');

const schema = {
  credential: joi
    .object({
      host: joi
        .string()
        .required()
        .description('Host url'),
      clientID: joi
        .string()
        .required()
        .description('Client ID to access the API'),
      secretKey: joi
        .string()
        .required()
        .description('SecretKey to access the API'),
      accessToken: joi
        .string()
        .description('Access Token for request')
    })
    .required()
    .description('Get Token schema'),
  listExamTimes: joi
    .object({
      userId: joi
        .string()
        .required()
        .description('ID of the user'),
      timeZone: joi
        .number()
        .integer()
        .required()
        .description('ID of the timezone'),
      examDate: joi
        .string()
        .required()
        .description('Date of the exam to list'),
      examDuration: joi
        .number()
        .integer()
        .required()
        .description('Time limit to take the exam in minutes')
    })
    .required()
    .description('List exam Times schema'),
  schedule: joi
    .object({
      userInfo: joi
        .object({
          userId: joi
            .string()
            .required()
            .description('ID of the user'),
          firstName: joi
            .string()
            .required()
            .description('First Name of the user'),
          lastName: joi
            .string()
            .required()
            .description('Last Name of the user'),
          emailAddress: joi
            .string()
            .email()
            .required()
            .description('Emailaddress of the user'),
        })
        .required()
        .description('User Details'),
      courseInfo: joi
        .object({
          courseId: joi
            .string()
            .required()
            .description('ID of the Course'),
          courseName: joi
            .string()
            .required()
            .description('Name of the Course')
        })
        .required()
        .description('Course Details'),
      examInfo: joi
        .object({
          examId: joi
            .string()
            .required()
            .description('ID of the exam'),
          examName: joi
            .string()
            .required()
            .description('Title of the exam'),
          examURL: joi
            .string()
            .uri()
            .required()
            .description('URL of the exam'),
          examDuration: joi
            .number()
            .integer()
            .required()
            .description('Time limit to take the exam in minutes'),
          examPassword: joi
            .string()
            .allow(null, '')
            .description('Restricts access to the exam with a password'),
          examUserName : joi
            .string()
            .allow(null, '')
            .description('Restricts access to the exam with a username.'),
          timeZone: joi
            .number()
            .integer()
            .required()
            .description('ID of the timezone'),
          examDate: joi
            .string()
            .isoDate()
            .regex(/.*Z/, 'ISO time format in utc zone')
            .example(utils.dateTemplate(), 'date template')
            .required()
            .description('Appointment date'),
          examInstruction  : joi
            .string()
            .allow(null, '')
            .example('Rule1|Rule2|Rule3')
            .description('Instructions to be followed, separated by "|"'),
          examLevel  : joi
            .string()
            .allow(null, '')
            .valid('1', '2', '3', '4', '5')
            .description('Enter the Exam Level value')
        })
        .required()
        .description('Exam details'),
    })
    .required()
    .description('Schedule schema'),

};

module.exports = schema;
