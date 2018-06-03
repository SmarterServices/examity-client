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
    .description('Get Token schema')
};

module.exports = schema;
