'use strict';

const joi = require('joi');
const utils = require('./../lib/helpers/utils');

const schema = {
  getToken: joi
  .object({
    clientID: joi
      .string()
      .required()
      .description('Client ID to access the API'),
    secretKey: joi
      .string()
      .required()
      .description('SecretKey to access the API')
  })
    .required()
    .description('Get Token schema')
};

module.exports = schema;
