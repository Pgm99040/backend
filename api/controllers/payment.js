'use strict';
// load the things we need
const mongoose = require('mongoose'); 
const moment = require('moment');
const async = require('async'); 
const fs = require('fs');
const Sentry = require("@sentry/node");
// Required services ====================================
const config = require('../../config') 
const aws = require('../../services/aws') 

// Required repos ======================================
const userRepo = require('../repository/user');
const mentorRepo = require('../repository/mentor');
const paymentRepo = require('../repository/payment');
const predefinedTaskRepo = require('../repository/predefinedtask');
const TaskEngagementRepo = require('../repository/taskengagement');

// Errors
const internalServerError = 'Internal server Error';
const noMentorsFoundErrorMsg = "No mentors available. Please try again later";

exports.userPaymenthistory = function(req, res, next) {
    //Generic Validation
    req.assert('id', 'id field can not be empty.').notEmpty();
   
	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
    const id = req.params.id;

    async.waterfall([
		function(callback) {
			userRepo.findUserWithId(id)
                .then((userFound) => {
                    if(userFound) {
                        callback()
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid user id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
        function(callback) {
			paymentRepo.userHistory(id)
                .then((result) => {
                    if(result) {
                        callback(null,result)
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid user id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
        function(result,callback) {
			paymentRepo.creditHistory(id)
                .then((creditresult) => {
                    if(creditresult) {
                       
                        callback(null,result,creditresult)
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid user id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
    ], function(err, result,creditresult) {
		if(err) {
			return res.json({status_code:500, success: false, message:internalServerError, Error: err})
		}else {
			return res.json({status_code:200, success: true, result: result,creditHistory:creditresult, message:'Payment history.'})
		}
	})
}

exports.mentorPaymenthistory = function(req, res, next) {
    //Generic Validation
    req.assert('id', 'id field can not be empty.').notEmpty();
   
	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
    const id = req.params.id;

    async.waterfall([
		function(callback) {
			mentorRepo.findMentorWithId(id)
                .then((mentorFound) => {
                    if(mentorFound) {
                        callback()
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid mentor id.'})
                    }
                })
                .catch(err => {
                    callback(err)
                })
        },
        function(callback) {
			paymentRepo.mentorHistory(id)
                .then((result) => {
                    if(result) {
                        callback(null, result)
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid mentor id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
    ], function(err, result) {
		if(err) {
			return res.json({status_code:500, success: false, message:internalServerError, Error: err})
		}else {
			return res.json({status_code:200, success: true, result: result, message:'Payment history.'})
		}
	})
}

exports.isTaskPurchased = async function(req, res){
    const data = req.user;
    console.log(`${data.email} accessing task-detail page`);
    Sentry.addBreadcrumb({
        category: "auth",
        message: `${data.email} accessing task-detail page`,
        level: Sentry.Severity.Info,
    });
    const id = req.params.id;
    const userId = req.params.userId;
    await paymentRepo.findWithIdTaskId(id, userId).then(response =>{
        if (response){
            res.status(200).send(response);
        } else{
            res.status(200).send({msg: "you have not this task purchase"});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error"});
        console.log("err---->", err);
    })
};
exports.taskPurchasedForUsers = async function(req, res){
    await paymentRepo.listPayment().then(response =>{
        console.log("taskPurchasedForUsers---->>", response)
        if (response){
            res.status(200).send(response);
        } else{
            res.status(200).send({msg: "you have not this task purchase"});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error"});
        console.log("err---->", err);
    })
};