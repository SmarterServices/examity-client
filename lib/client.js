'use strict';

const _ = require('lodash');
const joi = require('joi');
const requestPromise = require('request-promise');
const apiList = require('../data/api-list.json');
const errorCodeList = require('../data/error-codes');
const payloadSchema = require('../schema/payload-schema');
const utils = require('./helpers/utils');

const CREDENTIAL_PROPERTIES = [
  'host',
  'clientID',
  'secretKey'
];

class Client {

  /**
   * Modifies host string to remove unnecessary part
   * @param {string} host - Host name for request
   * @returns {string} modifiedHost - Modified name of the host
   * @private
   */
  _sanitizeHost(host) {
    let modifiedHost = host;
    if (host.endsWith('/')) {
      //if host ends with a slash,
      //drop that since there is one in apiList
      modifiedHost = host.slice(0, host.length - 1);
    }
    return modifiedHost;
  }

  /**
   * Send the actual request with method, url and payload
   * @param {string} url - The url to request with
   * @param {string} method - The HTTP method
   * @param {string} accessToken - The accessToken to pass as authorization
   * @param {Object} [body] - The payload to send in request
   * @returns {Promise} - The response from examity
   * @private
   */
  _send(url, method, accessToken, body) {

    const requestOptions = {
      url,
      method,
      body,
      json: true,
      resolveWithFullResponse: false,
      headers: {
        Authorization: accessToken
      }
    };

    return requestPromise(requestOptions)
      .then((response) => {
        const statusCode = response.statusCode;

        if (errorCodeList[statusCode]) {
          //if statusCode is in error List
          //reject with response
          return Promise.reject(response);
        }

        return Promise.resolve(response);
      });
  }

  /**
   * Create url for request
   * @param {string} endpointName - Name of the endpoint
   * @param {string} host - The host name to request with
   * @param {Object} [params] - Param values
   * @param {Object} [query] - Query values
   * @returns {string} url - Url to request with
   * @private
   * @memberof Client
   */
  _getUrl(endpointName, host, params = {}, query) {
    const urlTemplate = host + apiList[endpointName].endpoint;

    const url = utils.buildUrl(urlTemplate, params, query);
    return url;
  }

  /**
   * Validates request payload against joi schema
   * @param {String} methodName - Request method name
   * @param {Object} payload - Request payload
   * @returns {Promise} - Resolves with empty response
   * @private
   */
  _validateData(methodName, payload) {
    let schema = payloadSchema[methodName] || {};

    return new Promise(function (resolve, reject) {
      joi.validate(payload, schema, function (error) {
        if (error) {
          return reject(_.get(error, 'details[0].message'));
        }
        resolve();
      });
    });

  }

  /**
   * Validate options provided in the API method
   * and returns validated Objects
   * @param {string} apiName - API name in API list
   * @param {Object} options - The options object
   * @returns {Promise.<TResult>}
   * @resolves {{credentials:Object, payload:Object}}
   * @private
   */
  _validateOptions(apiName, options) {
    const credentials = _.pick(options, CREDENTIAL_PROPERTIES);
    const payload = _.omit(options, CREDENTIAL_PROPERTIES);


    return this
      ._validateData('credential', credentials)
      .then(() => this._validateData(apiName, payload))
      .then(() => {
        return Promise.resolve({credentials, payload});
      });
  }

  /**
   * Sets property in instance that is required for request
   * @param {string} apiName - Name of the Api
   * @param {Object} credentials - The credential required for request
   * @param {string} credentials.host - The host name
   * @param {string} credentials.clientID - The client ID to request
   * @param {string} credentials.secretKey - The secretKey against the client id
   * @param {string} [credentials.accessToken] - The accessToken for api call
   * @param {Object} [params] - Param values
   * @param {Object} [payload] - The payload that needs to send
   * @param {Object} [query] - The query parameter
   * @returns {Promise} - Data returned after request
   */
  _sendRequest(apiName, credentials, params = {}, payload = {}, query) {
    const host = this._sanitizeHost(credentials.host);
    const url = this._getUrl(apiName, host, params, query);
    const method = apiList[apiName].method;

    return this
      ._getAccessToken(credentials)
      .then((accessToken) => {
        return this._send(url, method, accessToken, payload);
      });
  }

  /**
   * Gets access token by providing the credentials
   * @param {Object} credentials - The credential required for request
   * @param {string} credentials.host - The host name
   * @param {string} credentials.clientID - The client ID to request
   * @param {string} credentials.secretKey - The secretKey against the client id
   * @param {string} [credentials.accessToken] - The accessToken for api call
   * @returns {string} - The accessToken
   * @private
   */
  _getAccessToken(credentials) {

    if (credentials.accessToken) {
      return credentials.accessToken;
    }

    const payload = _.omit(credentials, 'host');
    const requestOptions = {
      url: this._getUrl('getToken', credentials.host),
      body: payload,
      method: 'POST',
      json: true
    };
    return requestPromise(requestOptions)
      .then((response) => {
        return response.authInfo.access_token;
      });
  }

  /**
   * Retrieve access token to access other APIs.
   * @param {Object} options - Options to request with
   * @param {string} options.host - The host name
   * @param {string} options.clientID - The client ID to request
   * @param {string} options.secretKey - The secretKey against the client id
   * @returns {Promise<string>} - The accessToken
   */
  getToken(options) {
    return this
      ._validateOptions('credentials', options)
      .then((response) => {
        const {credentials} = response;
        return this._getAccessToken(credentials);
      });
  }

  /**
   * Retrieve the collection of timezone's.
   * @param {Object} options - The option necessary for request
   * @param {string} options.host - The host name
   * @param {string} options.clientID - The client ID to request
   * @param {string} options.secretKey - The secretKey against the client id
   * @param {string} [options.accessToken] - The accessToken for api call
   * @returns {Promise<Object>} - List of timezone
   */
  getTimezone(options) {
    const apiName = 'getTimezone';
    return this
      ._validateOptions(apiName, options)
      .then((response) => {
        const {credentials} = response;
        return this._sendRequest(apiName, credentials);
      });
  }



  /**
   * Retrieve the collection of timezone's.
   * @param {Object} options - The option necessary for request
   * @param {string} options.host - The host name
   * @param {string} options.clientID - The client ID to request
   * @param {string} options.secretKey - The secretKey against the client id
   * @param {string} options.courseId - Course id to get exams under
   * @param {string} options.pagenum - Page number
   * @param {string} [options.accessToken] - The accessToken for api call
   * @returns {Promise<Object>} - List of timezone
   */
  listCourseExam(options) {
    const apiName = 'listCourseExam';

    return this
      ._validateOptions(apiName, options)
      .then((response) => {
        const {credentials, payload} = response;
        return this._sendRequest(apiName, credentials, payload);
      });
  }

/**
   * Retrieve collection of available examTimes on selected date for the given user
   * @param {Object} options - The option necessary for request
   * @param {string} options.host - The host name
   * @param {string} options.clientID - The client ID to request
   * @param {string} options.secretKey - The secretKey against the client id
   * @param {string} options.userId - ID of the user
   * @param {number} options.timeZone - ID of the timezone returned by lisTimezone
   * @param {string} options.examDate - Date of the exam to list
   * @param {number} options.examDuration - Time limit to take the exam in minutes
   * @param {string} [options.accessToken] - The accessToken for api call, if it is passed, it will not be generated
   * @returns {Promise<Object>} - List of available examTimes
   */
  listExamTimes(options) {
    const apiName = 'listExamTimes';
    return this
      ._validateOptions(apiName, options)
      .then((response) => {
        const {credentials, payload} = response;
        return this._sendRequest(apiName, credentials, {}, payload);
      });
  }

}

module.exports = Client;
