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
    .description('List course exam schema'),
  listUserExam: joi
    .object({
      courseId: joi
        .string()
        .required()
        .description('Course ID'),
      userId: joi
        .string()
        .required()
        .description('User ID'),
      pagenum: joi
        .number()
        .integer()
        .required()
        .description('Page number'),
    })
    .required()
    .description('List user exam schema'),
};

module.exports = schema;
