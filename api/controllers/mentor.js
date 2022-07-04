
'use strict';
// load the things we need
const mongoose = require('mongoose');
const moment = require('moment');
const async = require('async');
const jwt = require('jwt-simple');

// Required services ====================================
const config = require('../../config')
const tokens = require('../models/tokens');
const jwtTokenSecret = config.masterToken;
const errorsUtil = require('../../utils/errors')
// Required repos ======================================
const userRepo = require('../repository/user');
const mentorRepo = require('../repository/mentor');
const paymentRepo = require('../repository/payment');
const predefinedTaskRepo = require('../repository/predefinedtask');
const TaskEngagementRepo = require('../repository/taskengagement');


const Mentor = mongoose.model('Mentor');
// Errors
const internalServerError = 'Internal server Error';
const noMentorsFoundErrorMsg = "No mentors available. Please try again later";

//email
const emailService = require('../../services/mail');
let adminEmail = config.adminEmail;
// Generic Functions;
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

exports.getActiveTask = function(req, res, next) {
	req.assert('mentorId', 'mentorId field can not be empty.').notEmpty();

	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
	const mentorId = req.params.mentorId;
	async.waterfall([
		function(callback) {
			mentorRepo.findMentorWithId(mentorId)
				.then((mentorFound) => {
					if(mentorFound) {
						callback()
					}else {
						return res.json({status_code:404, success: false, message:'Invalid user id.'})
					}
				})
				.catch(err => {
					callback(err)
				})
		},
		function(callback) {
			mentorRepo.getActiveTask(mentorId)
			.then((task) => {
				if(task) {
                    callback(null, task)
				}else {
					return res.json({status_code:204, success: false, result: result, message:'No active task found.'})
				}
			})
			.catch((err) => {
				console.log(err)
				return res.json({status_code:500, success: false, message:internalServerError, Error: err})
			})
		}
	], function(err, result) {
		if(err) {
			return res.json({status_code:500, success: false, message:internalServerError, Error: err})
		}else {
			return res.json({status_code:200, success: true, result: result, message:'Active task found.'})
		}
	})

}


exports.getProfileDetails = async (req, res) => {
	req.assert('mentorId', 'mentorId field can not be empty.').notEmpty();
	const errors = req.validationErrors();

	if (errors) {
		return res.send({ status_code: 400, status: 'failure', message: errors })
	}

	else {
		try {

			let profileDetails = await mentorRepo.getProfileDetails(req.params.mentorId);
			if (profileDetails)
				res.status(200).json({ status_code: 200, status: 'success', profileDetails: profileDetails });
			else
				res.status(400).json({ status_code: 400, status: 'failure', message: "Error fetching the profile details" })
		}
		catch (err) {
			res.status(500).json({ status_code: 500, status: 'Failure', message: err })
		}
	}

};

exports.getMentorIdByUsername =  async (req, res) => {
	req.assert('userName', 'userName field can not be empty.').notEmpty();
	const errors = req.validationErrors();

	if (errors) {
		return res.send({ status_code: 400, status: 'failure', message: errors })
	}

	else {
		try {

			let mentorId = await mentorRepo.getMentorId(req.body.userName)
			if (mentorId)
				res.status(200).json({ status_code: 200, status: 'success', mentorId: mentorId.mentor})
			else
				res.status(400).json({ status_code: 400, status: 'failure', message: "Error fetching the mentorId " })
		}
		catch (err) {
			res.status(500).json({ status_code: 500, status: 'Failure', message: err })
		}
	}

}

exports.getMentorWithId = async (req, res) =>{
	const id = req.params.id;
	const response = await mentorRepo.findMentorWithId(id);
	if (response){
		res.status(200).json({ status_code: 200, status: 'success', success: true, result: response});
	}else {
		res.status(200).json({ status_code: 200, status: 'success', success: false, result: "mentors not available"});
	}
};

exports.updateMentor = async (req, res) => {
	const id = req.params.id;
	const data = req.body;
	await mentorRepo.updateMentorById(id, data).then(response =>{
		if (response){
			res.status(200).send(response);
		} else {
			res.status(400)
		}
	}).catch(err =>{
		console.log("error", err);
	});
};

exports.getAllMentorBio = async (req, res) => {
	try {
		const data = await Mentor.find({}).select('mentorBio currentPosition imageUrl').lean();
		res.send({msg: "done", data})
	} catch (e) {
		console.log("e", e)
		res.status(400).send({msg: "fail"})
	}
};
