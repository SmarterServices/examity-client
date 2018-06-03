'use strict';
const nock = require('nock');
const examityData = require('../data/examity');
const EXAMITY_HOST = examityData.getToken.payload.host;
const apiList = require('./../../data/api-list');
const utils = require('./../../lib/helpers/utils');

const ProctorUMocker = {
  activeMocks: [],

  /**
   * Mock get endpoint by methodName
   * @param {string} methodName - Name of the method to mock
   * @param {string} [responseType] - Response type
   * @param {string} [statusCode] - Status code
   * @param {Object} [params] - Parameter for the path
   * @returns {*} - Scope for the mock
   */
  getEndpointMocker: function (methodName, responseType = 'valid', statusCode = 200, params = {}) {
    const urlTemplate = apiList[methodName].endpoint;
    const url = utils.buildUrl(urlTemplate, params);

    let scope = nock(EXAMITY_HOST)
      .persist()
      .get(url)
      .query(true)
      .reply(function () {
        return [statusCode, examityData[methodName].response[responseType]];
      });
    this.activeMocks.push(scope);
    return scope;
  },

  /**
   * Mock post endpoint by methodName
   * @param {String} methodName
   * @param {String} [responseType]
   * @param {Object} [params] - Parameter for the path
   * @returns {*}
   */
  postEndpointMocker: function (methodName, responseType = 'valid', params = {}) {
    const urlTemplate = apiList[methodName].endpoint;
    const url = utils.buildUrl(urlTemplate, params);

    let scope = nock(EXAMITY_HOST)
      .persist()
      .post(url)
      .reply(function () {
        return [200, examityData[methodName].response[responseType]];
      });
    this.activeMocks.push(scope);
    return scope;
  },

  /**
   * Mock put endpoint by methodName
   * @param {String} methodName
   * @param {String} [responseType]
   * @returns {*} - Scope for the mock
   */
  putEndpointMocker: function (methodName, responseType = 'valid') {

    let scope = nock(EXAMITY_HOST)
      .persist()
      .put(apiList[methodName].endpoint)
      .reply(function () {
        return [200, examityData[methodName].response[responseType]];
      });
    this.activeMocks.push(scope);
    return scope;
  },

  reset: nock.cleanAll,

  /**
   * Removes All interceptor
   */
  removeInterceptor: function removeInterceptor() {
    this.activeMocks.forEach(scope => {
      scope.interceptors.forEach(interceptor => nock.removeInterceptor(interceptor));
    });
    this.activeMocks = [];
  }
};

module.exports = ProctorUMocker;
