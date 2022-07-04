var crypto = require('crypto'),
    algorithm = 'aes-128-ecb', 
    secretKey = 'peerlypeerlypeerlypeerlypeerly';

var exports = module.exports = {};

	/*exports.encrypt = function(text)
	{
		var cipher = crypto.createCipher(algorithm,secretKey)
		var crypted = cipher.update(text,'utf8','hex')
		crypted += cipher.final('hex');
		return crypted;
	},
		 
	exports.decrypt = function (text)
	{
		var decipher = crypto.createDecipher(algorithm,secretKey)
		var dec = decipher.update(text,'hex','utf8')
		dec += decipher.final('utf8');
		return dec;
	}*/
	//AES FOR ANDROID
	exports.encrypt = function (text) {
	    var cipher = crypto.createCipher(algorithm,secretKey);
	    return cipher.update(text,'utf8','hex') + cipher.final('hex');
	};

	exports.decrypt = function(text) {
	    var cipher = crypto.createDecipher(algorithm,secretKey);
	    return cipher.update(text,'hex','utf8') + cipher.final('utf8');
	}