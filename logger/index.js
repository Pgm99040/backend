var winston = require('winston');
var config = require('../config');
//winston.emitErrs = true;

if (config.env == 'production') {
  var logger =winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: 'api.log',
        handleExceptions: true,
        json: false,
        colorize: false
      })
    ],
    exitOnError: false
  });
} else  {
  var logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        level: 'info',
        handleExceptions: true,
        json: true,
        colorize: true

      })
    ],
    exitOnError: false
  });
}



module.exports.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};


module.exports = logger;