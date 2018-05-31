'use strict';
const nock = require('nock');
const examityData = require('../data/examity');
const EXAMITY_HOST = examityData.config.host;
const apiList = require('./../../data/api-list');

const ProctorUMocker = {
  activeMocks: [],

  /**
   * Mock get endpoint by methodName
   * @param {String} methodName
   * @param {String} [responseType]
   * @returns {*}
   */
  getEndpointMocker: function (methodName, responseType = 'valid') {

    let scope = nock(EXAMITY_HOST)
      .persist()
      .get(apiList[methodName].endpoint)
      .query(true)
      .reply(function () {
        return [200, proctorUData[methodName].response[responseType]];
      });
    this.activeMocks.push(scope);
    return scope;
  },

  postEndpointMocker: function (methodName, responseType = 'valid') {

    let scope = nock(EXAMITY_HOST)
      .persist()
      .post(apiList[methodName].endpoint)
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
