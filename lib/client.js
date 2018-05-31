'use strict';

const _ = require('lodash');
const joi = require('joi');
const requestPromise = require('request-promise');
const apiList = require('../data/api-list.json');
const payloadSchema = require('../schema/payload-schema');
const utils = require('./helpers/utils');

class Client {
  /**
   * Configure the client
   * @param {Object} config - Config object
   * @param {Object} config.accessToken - Token to use as header
   * @param {string} config.host - Host url to request
   * @private
   */
  constructor(config) {
    this._accessToken = config.accessToken;
    this._host = this._sanitizeHost(config.host);
  }

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
   * Set method and endpoint to instance
   * @param {string} method - HTTP method
   * @param {string} url - Url to request for
   * @return {Object<Client>} - Instance of client
   * @memberof Client
   * @private
   */
  _setMethodAndEndpoint(method, url) {
    this._method = method;
    this._url = url;
    return this;
  }

  /**
   * Set method and endpoint to instance for get endpoint
   * @param {string} endpoint - Name of the get endpoint
   * @returns {Object<Client} - Instance of client
   * @memberof Client
   * @private
   */
  _get(endpoint) {
    return this._setMethodAndEndpoint('GET', endpoint);
  }

  /**
   * Set method and endpoint to instance for post endpoint
   * @param {string} endpoint - Name of the post endpoint
   * @returns {Object<Client} - Instance of client
   * @memberof Client
   * @private
   */
  _post(endpoint) {
    return this._setMethodAndEndpoint('POST', endpoint);
  }

  /**
   * Set method and endpoint to instance for put endpoint
   * @param {string} endpoint - Name of the put endpoint
   * @returns {Object<Client} - Instance of client
   * @memberof Client
   * @private
   */
  _put(endpoint) {
    return this._setMethodAndEndpoint('PUT', endpoint);
  }

  /**
   * Set method and endpoint to instance for delete endpoint
   * @param {string} endpoint - Name of the delete endpoint
   * @returns {Object<Client} - Instance of client
   * @memberof Client
   * @private
   */
  _delete(endpoint) {
    return this._setMethodAndEndpoint('DELETE', endpoint);
  }

  /**
   * Set the payload to send
   * @param {Object} payload - The payload to request with
   * @return {Object<Client>} - Instance of client
   * @memberof Client
   * @private
   */
  _send(payload) {
    this._payload = payload;
    return this;
  }

  /**
   * Send the actual request with set method, url and payload
   * @return {Promise} - response
   * @memberof Client
   * @private
   */
  _end() {

    const requestOptions = {
      url: this._url,
      method: this._method,
      json: true,
      body: this._payload,
      resolveWithFullResponse: false
    };

    if (this._accessToken) {
      requestOptions.Authorization = this._accessToken;
    }

    return requestPromise(requestOptions)
      .then((response) => {
        //todo return error code
        return Promise.resolve(response);
      });
  }

  /**
   * Create url for request
   * @param {string} endpointName - Name of the endpoint
   * @param {Object} [params] - Param values
   * @param {Object} [query] - Query values
   * @returns {string} url - Url to request with
   * @private
   * @memberof Client
   */
  _getUrl(endpointName, params = {}, query) {
    const urlTemplate = this._host + apiList[endpointName].endpoint;
    const method = apiList[endpointName].method;

    const url = utils.buildUrl(urlTemplate, params, query);
    return url;
  }

  /**
   * Validates request payload against joi schema
   * @param {String} methodName - Request method name
   * @param {Object} payload - Request payload
   * @returns {Promise}
   * @private
   */
  _validateData(methodName, payload) {
    let schema = payloadSchema[methodName];

    return new Promise(function (resolve, reject) {
      joi.validate(payload, schema, function (error, data) {
        if (error) {
          return reject(_.get(error, 'details[0].message'));
        }
        resolve();
      });
    });

  }

  /**
   * Retrieve access token to access other API's.
   * @param {Object} payload - Access Token related payload
   * @param {string} payload.clientID - Client ID to access the API.
   * @param {string} payload.secretKey - SecretKey to access the API.
   * @returns {Promise<Object>} - Access Token with message
   */
  getToken(payload) {
    const _this = this;
    return this
      ._validateData('getToken', payload)
      .then(()=>{
        return this._getUrl('getToken');
      })
      .then((url)=>{
        return _this
          ._post(url)
          ._send(payload)
          ._end();
      });
  }

}

module.exports = Client;
