/**
 * Module dependencies.
 */
const jwt = require('jwt-simple');
const	mongoose = require('mongoose');
const	moment = require('moment');

// load required property files =======================
const propertiesFile = require('../config/properties.js');


// Required models ====================================
const User = mongoose.model('User');
const Admin = mongoose.model('Admin');

   
module.exports = function(req, res, next) {
	const token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token'];
	
	if (token) {
		try {
			const decoded = jwt.decode(token, propertiesFile.secret);
			// handle token here
			if (decoded.exp <= moment()) {
				return res.json({status_code:506, status:'failure', message:'Access token has expired.'});
			}
			else {
				User.findOne({id: decoded.iss }, function(err, user) {
					if(employee) {
						req.user = user;
						next();
					}
					else {
						Admin.findOne({ id : decoded.iss }, function(err, admin) {
							if(admin) {
								req.admin = admin;
								next();
							}else {
								return res.json({status_code:500, status:'failure', message:'Invalid token.'});
							}
						})
					}
				})
			}
		}
		catch (err) {
			res.json({ success: false, message: 'Failed to authenticate token.' }); 
		}
	} 
	else {
		res.json({ success: false, message: 'No Token Provided.' }); 
	}
};