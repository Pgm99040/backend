'use strict';

const Promise = require('bluebird');
const rp = require('request-promise');

module.exports.get = function(url, queryParams = {}, headers = {}) {
  return rp({
    url: url,
    method: 'GET',
    qs: queryParams,
    headers: headers,
    json: true
  });
}

module.exports.post = function(url, body = {}, headers = {}) {
  return rp({
    url: url,
    method: 'POST',
    body: body,
    headers: headers,
    json: true
  });
}
