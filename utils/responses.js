const err = require('./errors').errors;
module.exports = {
  getErrorResponse: function(message) {
    let resp = {};
    Object.assign(resp, response);
    if (!message) {
      message = err.genericError;
    }
    resp.message = message
    delete resp.data;
    console.log("resp--------------->", resp);
    return resp;
  },

  getSuccessResponse: function(data, message) {
    let resp = {};
    Object.assign(resp, response);
    resp.success = true;
    resp.data = data;
    resp.message = message || null;

    if (!resp.data) {
      delete resp.data;
    }
    if (!resp.message) {
      delete resp.message;
    }
    return resp;
  }
}

const response = {
  success: false,
  message: '',
  data: {}
}
