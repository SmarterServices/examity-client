'use strict';

const _ = require('lodash');
const joi = require('joi');
const requestPromise = require('request-promise');
const crypto = require('crypto');


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
   * @param {Number} successCode - Response code for request
   * @returns {Promise} - The response from examity
   * @private
   */
  _send(url, method, accessToken, body, successCode = 200) {

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

        //If status code is a success for the request resolve the promise
        if (statusCode === successCode) {
          return Promise.resolve(response);
        }

        return Promise.reject(response);

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
   * @param {Object} [payload] - The payload that getTokenneeds to send
   * @param {Object} [query] - The query parameter
   * @returns {Promise} - Data returned after request
   */
  _sendRequest(apiName, credentials, params = {}, payload = {}, query) {
    const host = this._sanitizeHost(credentials.host);
    const url = this._getUrl(apiName, host, params, query);
    const method = apiList[apiName].method;
    const successCode = apiList[apiName].successCode;

    return this
      ._getAccessToken(credentials)
      .then((accessToken) => {
        return this._send(url, method, accessToken, payload, successCode);
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
   * Retrieve exams under course
   * @param {Object} options - The option necessary for request
   * @param {string} options.host - The host name
   * @param {string} options.clientID - The client ID to request
   * @param {string} options.secretKey - The secretKey against the client id
   * @param {string} options.courseId - Course id to get exams under
   * @param {string} options.pagenum - Page number
   * @param {string} [options.accessToken] - The accessToken for api call
   * @returns {Promise<Object>} - List of exams
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
   * Retrieve exams under user
   * @param {Object} options - The option necessary for request
   * @param {string} options.host - The host name
   * @param {string} options.clientID - The client ID to request
   * @param {string} options.secretKey - The secretKey against the client id
   * @param {string} options.userId - User id to get exams under
   * @param {string} options.courseId - Course id to get exams under
   * @param {string} options.pagenum - Page number
   * @param {string} [options.accessToken] - The accessToken for api call
   * @returns {Promise<Object>} - List of exams
   */
  listUserExam(options) {
    const apiName = 'listUserExam';

    return this
      ._validateOptions(apiName, options)
      .then((response) => {
        const {credentials, payload} = response;
        const params = {pagenum: payload.pagenum};

        delete payload.pagenum;

        return this._sendRequest(apiName, credentials, params, payload);
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

  /**
   * Schedule examAppointment on selected date and time for the given user
   * @param {Object} options - The option necessary for request
   * @param {string} options.host - The host name
   * @param {string} options.clientID - The client ID to request
   * @param {string} options.secretKey - The secretKey against the client id
   * @param {string} [options.accessToken] - The accessToken for api call, if it is passed, it will not be generated
   * @param {Object} options.userInfo - User Details
   * @param {string} options.userInfo.userId - ID of the user
   * @param {string} options.userInfo.firstName - First Name of the user
   * @param {string} options.userInfo.lastName - Last Name of the user
   * @param {string} options.userInfo.emailAddress - Emailaddress of the user
   * @param {Object} options.courseInfo - Course Details
   * @param {string} options.courseInfo.courseId - ID of the Course
   * @param {string} options.courseInfo.courseName - Name of the Course
   * @param {Object} options.examInfo - Exam Details
   * @param {string} options.examInfo.examId - ID of the exam
   * @param {string} options.examInfo.examName - Title of the exam
   * @param {string} options.examInfo.examURL - URL of the exam
   * @param {number} options.examInfo.examDuration - Time limit to take the exam in minutes
   * @param {string} [options.examInfo.examPassword] - Restricts access to the exam with a password
   * @param {string} [options.examInfo.examUserName] - Restricts access to the exam with a username
   * @param {string} options.examInfo.timeZone - ID of the timezone returned by lisTimezone
   * @param {string} options.examInfo.examDate - Appointment date
   * @param {string} [options.examInfo.examInstruction] - Instructions to be followed, separated by "|"
   * @param {string} [options.examInfo.examLevel] - The level of exam
   * @returns {Promise<Object>} - Appointment info
   */
  scheduleAppointment(options) {
    const apiName = 'scheduleAppointment';
    return this
      ._validateOptions(apiName, options)
      .then((response) => {
        const {credentials, payload} = response;
        return this._sendRequest(apiName, credentials, {}, payload);
      });
  }

  /**
   * Reschedule examappointment on selected date and time for the given TransactionId
   * @param {Object} options - The option necessary for request
   * @param {string} options.host - The host name
   * @param {string} options.clientID - The client ID to request
   * @param {string} options.secretKey - The secretKey against the client id
   * @param {string} [options.accessToken] - The accessToken for api call, if it is passed, it will not be generated
   * @param {number} options.transactionId - AppointmentId of the Exam
   * @param {Object} options.courseInfo - Course Details
   * @param {string} options.courseInfo.courseId - ID of the Course
   * @param {string} options.courseInfo.courseName - Name of the Course
   * @param {Object} options.examInfo - Exam Details
   * @param {string} options.examInfo.examId - ID of the exam
   * @param {string} options.examInfo.examName - Title of the exam
   * @param {string} options.examInfo.examURL - URL of the exam
   * @param {number} options.examInfo.examDuration - Time limit to take the exam in minutes
   * @param {string} [options.examInfo.examPassword] - Restricts access to the exam with a password
   * @param {string} [options.examInfo.examUserName] - Restricts access to the exam with a username
   * @param {string} options.examInfo.timeZone - ID of the timezone returned by lisTimezone
   * @param {string} options.examInfo.examDate - Appointment date
   * @param {string} [options.examInfo.examInstruction] - Instructions to be followed, separated by "|"
   * @param {string} [options.examInfo.examLevel] - The level of exam
   * @returns {Promise<Object>} - Rescheduled Appointment info
   */
  rescheduleAppointment(options) {
    const apiName = 'rescheduleAppointment';
    return this
      ._validateOptions(apiName, options)
      .then((response) => {
        const {credentials, payload} = response;
        return this._sendRequest(apiName, credentials, {}, payload);
      });
  }


  /**
   * Cancel appointment for an exam
   * @param {Object} options - The option necessary for request
   * @param {string} options.host - The host name
   * @param {string} options.clientID - The client ID to request
   * @param {string} options.secretKey - The secretKey against the client id
   * @param {string} [options.accessToken] - The accessToken for api call, if it is passed, it will not be generated
   * @param {number} options.transactionId - AppointmentId of the Exam
   * @returns {Promise<Object>} - Delete Appointment info
   */
  cancelAppointment(options) {
    const apiName = 'cancelAppointment';
    return this
      ._validateOptions(apiName, options)
      .then((response) => {
        const {credentials, payload} = response;
        return this._sendRequest(apiName, credentials, payload);
      });
  }


  /**
   * Return html form for requesting exam start request to examity
   * @param {Object} options - The option necessary for request
   * @param {string} options.actionUrl - Url to submit the form to
   * @param {string} options.userId - Id of the user for whom the exam is scheduled
   * @param {string} options.encryptionKey - Encryption key to encrypt the userId with
   * @returns {Promise<String>} - Resolves with html that contains the form to submit
   */
  getStartExamSSORequest(options) {
    const {actionUrl, userId, encryptionKey} = options;
    const encryptedUserId = this._encryptText(userId, encryptionKey);

    const htmlBody = this._getHtmlForm({
      actionUrl,
      name: 'login',
      method: 'Post',
      inputs: [{
        key: 'UserName',
        value: encryptedUserId
      }]
    });

    return Promise.resolve({htmlBody});


  }


  /**
   * Return html form for requesting exam start request to examity
   * @param {Object} options - The option necessary for request
   * @param {string} options.actionUrl - Url to submit the form to
   * @param {string} options.transactionId - TransactionId of the exam session
   * @param {string} options.encryptionKey - Encryption key to encrypt the userId with
   * @returns {Promise<String>} - Resolves with html that contains the form to submit
   */
  getReviewExamSSORequest(options) {
    const {actionUrl, transactionId, encryptionKey} = options;
    const encryptedTransactionId = this._encryptText(transactionId, encryptionKey);

    const url = utils.buildUrl(actionUrl, {transactionId: encryptedTransactionId});

    return Promise.resolve({url});
  }

  /**
   * Get formatted html form
   * @param {Object} options - Information to build the form
   * @param {string} options.name - The form name
   * @param {string} options.method - Method to submit the form in
   * @param {string} options.actionUrl - Path to which the form shoudl be submitted to
   * @param {Array} options.Input - Input to sent with the url
   * @returns {string} - Html body
   * @private
   */
  _getHtmlForm(options) {
    const inputs = options.inputs;
    let inputHtml = '';

    inputs.forEach((input) => {
      inputHtml += `<input name="${input.key}" type="hidden" value="${input.value}"> `;
    });

    return `<html lang="en">
    <head>
    </head>
    <body>
      <form name="${options.name}" method="${options.method}" action="${options.actionUrl}">
        ${inputHtml}
      </form>
    </body>
    <script type="text/javascript">
        window.onload=function(){
            document.forms["login"].submit();
        }
    </script>
</html>`;
  }

  /**
   * Encrypt tex with aes-128-cbc encryption
   * @param {String} text - Text to encrypt
   * @param {String} encryptionKey - Key to encrypt the text with
   * @returns {string} - Encrypted key in base64 format
   * @private
   */
  _encryptText(text, encryptionKey) {
    //Get the first 128 bit of the encryption key
    encryptionKey = encryptionKey.slice(0, 16);
    const keyBuffer = new Buffer(encryptionKey);
    const iv = encryptionKey;

    const encryptionMethod = 'aes-128-cbc';
    const cipher = crypto.createCipheriv(encryptionMethod, keyBuffer, iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return Buffer.from(encrypted).toString('base64');
  }

}

module.exports = Client;
