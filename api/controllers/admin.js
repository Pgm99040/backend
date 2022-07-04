'use strict';
// load the things we need
const user = require("./user");
const mongoose = require('mongoose');
const moment = require('moment');
const async = require('async');
const jwt = require('jwt-simple');
var bcrypt = require('bcrypt-nodejs');

const config = require('../../config')
const tokens = require('../models/tokens');

const jwtTokenSecret = config.jwtSecretKey;
// Required models ====================================
const Admin = mongoose.model('Admin');
const mentor = require("../models/mentor")

// Required repos ======================================
const userRepo = require('../repository/user');
const mentorRepo = require('../repository/mentor');


const internalServerError = 'Internal server Error';
/**
 * POST /addAdmin
 */
exports.addAdmin = function (req, res, next) {

	// Generic validation
	req.assert('name', 'name name field can not be empty.').notEmpty();
	req.assert('email', 'email name field can not be empty.').notEmpty();
	req.assert('password', 'password field can not be empty.').notEmpty();
	req.assert('adminType', 'adminType field can not be empty.').notEmpty();
	const errors = req.validationErrors();

	if (errors) {
		return res.send({ status_code: 400, status: 'failure', message: errors })
	}

	// Request Data
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const adminType = req.body.adminType;

	async.waterfall([
		function (callback) {
			Admin.findOne({ email: email }).exec(function (err, adminFound) {
				if (err) {
					callback(err)
				} else {
					if (adminFound) {
						return res.json({ status_code: 409, status: 'failure', message: 'Account with that email is already exists.' })
					} else {
						const newAdmin = new Admin();
						newAdmin.name = name;
						newAdmin.email = email;
						newAdmin.password = newAdmin.generateHash(password);
						newAdmin.adminType = adminType;
						newAdmin.save(function (err, newAdmin) {
							if (err) {
								callback(err)
							} else {
								callback(null, newAdmin)
							}
						})

					}
				}
			})
		}
	], function (err, result) {
		if (err) {
			return res.json({ status_code: 500, status: 'failure', message: 'Internal Server Error.', Error: err })
		} else {
			return res.json({ status_code: 201, status: 'success', result: result, message: 'New Admin Added Successfully.' })
		}
	})
}

/**
 * POST /adminLogin
 */
exports.adminLogin = function (req, res, next) {
	// Generic validation
	req.assert('email', 'email name field can not be empty.').notEmpty();
	req.assert('password', 'password field can not be empty.').notEmpty();
	req.assert('platform', 'platform field can not be empty.').notEmpty();
	console.log("adminLogin", req.body)
	const errors = req.validationErrors();

	if (errors) {
		return res.send({ status_code: 400, status: 'failure', message: errors })
	}

	// Request Data
	console.log("req.body======================",req.body)
	const email = req.body.email;
	const password = req.body.password;
	const platform = req.body.platform;
	const loginResponse = {
		name: '',
		email: '',
		adminType: '',
		token: ''
	}

	async.waterfall([
		function (callback) {
			Admin.findOne({ email: email }).exec(function (err, adminFound) {
				if (err) {
					callback(err)
				} else {
					if (!adminFound) {
						return res.json({ status_code: 403, status: 'failure', message: 'Invalid Credentials.' })
					} else {
						adminFound.validPassword(password, function (err, isMatch) {
							if (isMatch) {
								adminFound.lastLoggedIn = Date.now();
								adminFound.isLoggedIn = true;
								adminFound.save(function (err, adminFound) {
									if (err) {
										callback(err)
									} else {
										var resp = loginResponse;
										resp._id = adminFound._id;
										resp.name = adminFound.name;
										resp.email = adminFound.email;
										resp.adminType = adminFound.adminType;
										resp.token = ((typeof token == 'undefined') ? tokens.createNewToken('admin', adminFound, platform) : token);
										if (typeof resp.profilePicUrl != null) {
											resp.profilePicUrl = adminFound.profilePicUrl;
										}
										callback(null, resp)
									}
								})
							}
							else {
								return res.json({ status_code: 404, success: false, message: 'The password you entered is incorrect.' })
							}
						})
					}
				}
			})
		}
	], function (err, result) {
		if (err) {
			return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
		} else {
			return res.json({ status_code: 200, success: true, result: result, message: 'Login Success.' })
		}
	})
}

exports.mobileGoogleLogin=async(req,res)=>{
	req.assert('email', 'email name field can not be empty.').notEmpty();
	req.assert('password', 'password field can not be empty.').notEmpty();
	const errors = req.validationErrors();

	if (errors) {
		return res.send({ status_code: 400, status: 'failure', message: errors })
	}

	// Request Data
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const adminType = req.body.adminType;
	const loginResponse = {
		name: '',
		email: '',
		adminType: '',
		token: ''
	}
	async.waterfall([
		function (callback) {
			Admin.findOne({ email: email }).exec(function (err, adminFound) {
				if (err) {
					callback(err)
				} else {
					if (adminFound) {
						async.waterfall([
							function (callback) {
								Admin.findOne({ email: email }).exec(function (err, adminFound) {
									if (err) {
										callback(err)
									} else {
										if (!adminFound) {
											return res.json({ status_code: 403, status: 'failure', message: 'Invalid Credentials.' })
										} else {
											adminFound.validPassword(password, function (err, isMatch) {
												if (isMatch) {
													adminFound.lastLoggedIn = Date.now();
													adminFound.isLoggedIn = true;
													adminFound.save(function (err, adminFound) {
														if (err) {
															callback(err)
														} else {
															var resp = loginResponse;
															resp._id = adminFound._id;
															resp.name = adminFound.name;
															resp.email = adminFound.email;
															resp.adminType = adminFound.adminType;
															resp.token = ((typeof token == 'undefined') ? tokens.createNewToken('admin', adminFound, {platform:'web'}) : token);
															if (typeof resp.profilePicUrl != null) {
																resp.profilePicUrl = adminFound.profilePicUrl;
															}
															callback(null, resp)
														}
													})
												}
												else {
													return res.json({ status_code: 404, success: false, message: 'The password you entered is incorrect.' })
												}
											})
										}
									}
								})
							}
						], function (err, result) {
							if (err) {
								return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
							} else {
								return res.json({ status_code: 200, success: true, result: result, message: 'Login Success.' })
							}
						})
					} else {
						const newAdmin = new Admin();
						newAdmin.name = name;
						newAdmin.email = email;
						newAdmin.password = newAdmin.generateHash(password);
						newAdmin.adminType = adminType;
						newAdmin.save(function (err, newAdmin) {
							if (err) {
								callback(err)
							} else {
								const token = tokens.createNewToken('admin', newAdmin, {platform:'web'});
								newAdmin.token=token
								callback(null, newAdmin,token)
							}
						})

					}
				}
			})
		}
	], function (err, result,token) {
		if (err) {
			return res.json({ status_code: 500, status: 'failure', message: 'Internal Server Error.', Error: err })
		} else {
			return res.json({ status_code: 201, status: 'success', result: {result,token:token}, message: 'New Admin Added Successfully.' })
		}
	})
}

/**
 * Post /resetPasswordForAdmin
 */
exports.resetPasswordForAdmin = function (req, res, next) {
	// Password validation
	req.assert('password', 'Password field can not be empty.').notEmpty();
	req.assert('confirmPassword', 'Confirm password field can not be empty.').notEmpty();
	req.assert('password', 'Password must be between 6-15 characters long.').len(6, 15);
	req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);

	const errors = req.validationErrors();

	if (errors) {
		return res.send({ status_code: 400, status: 'failure', message: errors })
	}

	if (typeof (req.body.email_id) != undefined && (req.body.email_id) != null && (req.body.email_id) != 'null') {
		var email = req.body.email_id;
	}
	if (typeof (req.body.email) != undefined && (req.body.email) != null && (req.body.email) != 'null') {
		var email = crypto_fun.decrypt(req.body.email);
		var isWeb = true;
	}
	const password = req.body.password;
	const oldPassword = req.body.oldPassword;

	Admin.findOne({ email: email }).exec(function (err, adminFound) {
		if (err) {
			return res.json({ status_code: 500, status: 'failure', message: 'Internal Server Error.', Error: err })
		}
		else {
			if (adminFound) {
				adminFound.validPassword(oldPassword, function (err, isMatch) {
					if (isMatch) {
						adminFound.validPassword(password, function (err, isMatch) {
							if (isMatch) {
								return res.json({ status_code: 417, status: 'failure', message: 'New Password should not be same as old password.' })
							} else {
								adminFound.password = adminFound.generateHash(password);
								adminFound.save(function (err, passwordUpdated) {
									if (err) {
										return res.json({ status_code: 500, status: 'failure', message: 'Internal Server Error.', Error: err })
									} else {
										if (isWeb) {
											res.redirect('/reset-password-succuss');
										} else {
											return res.json({ status_code: 200, status: 'success', message: 'New password has been updated' })
										}
									}
								})
							}
						})
					} else {
						return res.json({ status_code: 404, status: 'failure', message: 'The password you entered is incorrect.' })
					}
				})


			} else {
				return res.json({ status_code: 409, status: 'failure', message: 'Invalid email address.' })
			}
		}
	})
}

/**
 * Post /approveMentor
 */
exports.approveMentor = function (req, res, next) {
	// Generic validation
	req.assert('mentorId', 'mentorId field can not be empty.').notEmpty();

	const errors = req.validationErrors();

	if (errors) {
		return res.send({ status_code: 400, status: 'failure', message: errors })
	}

	// Request Data
	const mentorId = req.body.mentorId;

	async.waterfall([
		function (callback) {
			userRepo.findMentorWithId(mentorId)
				.then((mentorFound) => {
					if (mentorFound) {
						callback()
					} else {
						return res.json({ status_code: 404, success: false, message: 'Invalid mentor id.' })
					}
				})
		},
		function (callback) {
			mentorRepo.update(mentorId, { isApproved: true })
				.then((result) => {
					if (result) {
						callback(null, result)
					} else {
						return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
					}
				})
		}
	], function (err, result) {
		if (err) {
			return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
		} else {
			return res.json({ status_code: 200, success: true, result: result, message: 'Request accept will be processed soon.' })
		}
	})
}

exports.addBonusCredits = async (req, res) => {
	req.assert('adminId', 'adminId field can not be empty.').notEmpty();
	req.assert('userId', 'userId field can not be empty.').notEmpty();

	const errors = req.validationErrors();

	if (errors) {
		return res.send({ status_code: 400, status: 'failure', message: errors })
	}
	else {
		try {
			let input = req.body
			let bonusCreditObj = {
				credits: input.credits,
				creditedDate:Date.now(),
				adminId: input.adminId
			}

			let updateObj = {}
			updateObj['$push'] = { bonusCreditDetails: bonusCreditObj }
			updateObj['$inc'] = { credits: input.credits }

			let addcredits = await userRepo.addBonusCredits(input.userId, updateObj)

			if (addcredits)
				res.status(200).json({ status_code: 200, status: 'success', message: "Bonus Credits added successfully" })
			else
				res.status(400).json({ status_code: 400, status: 'failure', message: "Error adding the bonus credits" })
		}
		catch (err) {
			res.status(500).json({ status_code: 500, status: 'Failure', message: err })
		}
	}
}

exports.getAllUser = function (req, res){
	userRepo.listUser().then(response =>{
		if (response){
			res.status(200).send(response);
		} else {
			res.status(400);
		}
	}).catch(err =>{
		console.log("error", err);
	});
};
exports.getAllMentors = function (req, res){
	userRepo.findIsMentorsTrue().then(response =>{
		if (response){
			res.status(200).send(response);
		} else {
			res.status(400);
		}
	}).catch(err =>{
		console.log("error", err);
	});
};

exports.getFindEmailByUser = function (req, res){
	const email = req.params.email;
	userRepo.findMentor(email).then(response =>{
		if (response){
			res.status(200).send(response);
		} else {
			res.status(400);
		}
	}).catch(err =>{
		console.log("error", err);
	});
}

exports.getFindEmailByMentor = function (req, res){
	const email = req.params.email;
	userRepo.findUser(email).then(response =>{
		if (response){
			res.status(200).send(response);
		} else {
			res.status(400);
		}
	}).catch(err =>{
		console.log("error", err);
	});
};

exports.becomeMentors = function(req, res){
	user.becomeMentor(req, res);
};

exports.userLoginAccess = function (req, res) {
	const id = req.params.id;
	const data = req.body.data;
	userRepo.userLoginAccess(id, data).then(response =>{
		if (response){
			res.status(200).send(response);
		} else {
			res.status(400)
		}
	}).catch(err =>{
		console.log("error", err);
	});
};

exports.getAllMentor = async (req, res) => {
	try {
		const data = await mentor.find({}).populate({path: 'user'});
		if(data.length){
			res.status(200).send(data);
		}else {
			res.status(400)
		}
	}catch (err) {
		res.status(500).json({ status_code: 500, status: 'Failure', message: err })
	}
};


exports.menteeLogin=async(req,res)=>{
	try {
		const getFindUser = await Admin.findOne({email: req.body.email});
		if (getFindUser) {
			const compare=getFindUser.validPassword(req.body.password, function(err, isMatch) {
				if(isMatch) {
					const menteeToken = tokens.createNewToken('user', getFindUser, {platform: 'web'})
					res.status(200).send({success: true, getFindUser, menteeToken: menteeToken});
				}else {
					res.status(400).json({status_code: 400, status: 'failure', message: "email & password is not valid"})
				}
			})
		} else {
			res.status(400).json({status_code: 400, status: 'failure', message: "email & password is not valid"})
		}
	}catch(e){
console.log('error',e)
	}
}