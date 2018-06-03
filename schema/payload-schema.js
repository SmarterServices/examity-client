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
  listCourseExam: joi
    .object({
      courseId: joi
        .string()
        .required()
        .description('Course ID'),
      pagenum: joi
        .number()
        .integer()
        .required()
        .description('Page number'),
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
    .description('List exam Times schema')
};

module.exports = schema;
