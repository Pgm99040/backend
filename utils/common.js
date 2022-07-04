'use strict';
const path = require('path')
const bcrpyt = require('bcrypt-nodejs')
const config = require('../config');
const moment = require('moment-timezone');
moment.suppressDeprecationWarnings = true;
const self = module.exports
module.exports.decodeBase64 = function(value) {
  return Buffer.from(value, 'base64').toString();
}

module.exports.encodeBase64 = function(value) {
  return new Buffer(value.toString()).toString('base64')
}

module.exports.getRandomCode = function(length, characters = '0123456789') {
  var rtn = '';
  for (var i = 0; i < length; i++) {
    rtn += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return rtn;
}

module.exports.slugify = function(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

module.exports.removeElementFromArray = function(array, element) {
  var index = array.indexOf(element);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
}

// Creates and returns hashed password.
module.exports.createPassword = function(password) {
  let actualPassword = getActualPassword(password);
  let hash = bcrpyt.hashSync(actualPassword);
  return hash;
}

module.exports.checkPassword = function(encryptedPassword, inputPassword) {
  let password = getActualPassword(inputPassword);
  return bcrpyt.compareSync(password, encryptedPassword);
}

// Extracts password from encoded string.
function getActualPassword(password) {
  var decodedPassword = self.decodeBase64(password);
  return decodedPassword.substr(10, 4);
}

// Get Local Converted Date
exports.localDateConverted = function (iterator,userTimezone) {
  let iteratorDate = moment(iterator.date).utc(false).format('MMM DD YYYY h:mm a');
  iteratorDate = moment(iteratorDate).tz(iterator.location).format('MMM DD YYYY h:mm a');
  let dateStartTime = moment(iteratorDate).format('MMM DD YYYY');
  let dateEndTime = moment(iteratorDate).format('MMM DD YYYY');
  const startTime = iterator.duration.split('-')[0];
  const endTime = iterator.duration.split('-')[1];
  dateStartTime = moment(dateStartTime + ' ' + startTime).format('MMM DD YYYY h:mm a');
  dateEndTime = moment(dateEndTime + ' ' + endTime).format('MMM DD YYYY h:mm a');
  dateStartTime = moment.tz(dateStartTime, 'MMM DD YYYY h:mm a', userTimezone).format('MMM DD YYYY h:mm a');
  dateEndTime = moment.tz(dateEndTime, 'MMM DD YYYY h:mm a', userTimezone).format('MMM DD YYYY h:mm a');
  const dateStartTimeAMPM = moment(dateStartTime).format('h:mm a');
  const dateEndTimeAMPM = moment(dateEndTime).format('h:mm a');
  const duration = `${dateStartTimeAMPM} - ${dateEndTimeAMPM}`;
  return {
    dateEndTime:dateEndTime,
    dateStartTime:dateStartTime,
    dateStartTimeAMPM:dateStartTimeAMPM,
    dateEndTimeAMPM:dateEndTimeAMPM,
    duration:duration
  }
};

module.exports.timeZoneList = [
  {name: "IST", value: "Asia/Calcutta"},
  {name: "SGT", value: "Asia/Singapore"},
  {name: "PST", value: "America/Los_Angeles"},
  {name: "PDT", value: "America/Los_Angeles"},
  {name: "EST", value: "America/New_York"},
  {name: "CST", value: "America/Chicago"}
];