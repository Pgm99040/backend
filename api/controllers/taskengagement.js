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
const taskEngage = require("../models/taskengagement");

// Errors
const internalServerError = 'Internal server Error';
const noMentorsFoundErrorMsg = "No mentors available. Please try again later";

//email
// const emailService = require('../../services/mail');
const sgSendMail = require('../../services/mail');
let adminEmail = config.adminEmail;
// Generic Functions;
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
/**
 * POST /uploadFile
 */
exports.submission = function(req, res, next) {
    //Generic Validation
    let secondPath = null;
    req.assert('taskEngagementId', 'taskEngagementId field can not be empty.').notEmpty();
    req.assert('uploadedBy', 'uploadedBy field can not be empty.').notEmpty();
    req.assert('description', 'description field can not be empty.').notEmpty();


    if((req.body.uploadedBy).toLowerCase()== "user") {
        req.assert('userId', 'userId field can not be empty.').notEmpty();
        secondPath = "user-submissions/user-"+req.body.userId+"/"
    }
    if((req.body.uploadedBy).toLowerCase()== "mentor") {
        req.assert('mentorId', 'mentorId field can not be empty.').notEmpty();
        secondPath = "mentor-submissions/mentor-"+req.body.mentorId+"/"
    }
    console.log(req.files.file)
    if(req.files.file==undefined || req.files.file==null) {
        req.assert('file', 'file field can not be empty.').notEmpty();
    }
	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
    const taskEngagementId = req.body.taskEngagementId;
    const uploadedBy = req.body.uploadedBy;
    const description = req.body.description;
    let fileUrl = null;

    // email prop
    let  menteeEmail = null;
    let  menteeName = null;

	let mentorUserId = null;
	let mentorEmail = null;
	let mentorName = null;
    let taskName = null;
    async.waterfall([
        function(callback) {
            TaskEngagementRepo.findTaskEngagementWithId(taskEngagementId)
                .then((taskEngagementFound) => {
                    if(taskEngagementFound) {
                        taskName = taskEngagementFound.task.name.capitalize();

                        menteeEmail = taskEngagementFound.user.email;
                        menteeName = taskEngagementFound.user.firstName.capitalize();;
                        console.log(menteeEmail, menteeName)

                        mentorEmail = taskEngagementFound.mentor.user.email;
                        mentorName = taskEngagementFound.mentor.user.firstName.capitalize();
                        console.log(mentorEmail, mentorName)

                        if(uploadedBy=="user") {
                            taskEngagementFound.user._id==req.body.userId ? callback() :
                             res.json({status_code:404, success: false, message:'users does not match.'})
                        }else if(uploadedBy=="mentor") {
                            taskEngagementFound.mentor._id==req.body.mentorId ? callback() :
                                res.json({status_code:404, success: false, message:'mentor does not match.'})
                        } else {
                            return res.json({status_code:500, success: false, message:internalServerError, Error: err})
                        }

                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
		function(callback) {
			if(uploadedBy=="user") {
                userRepo.findUserWithId(req.body.userId)
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
            }
            else if(uploadedBy=="mentor") {
                mentorRepo.findMentorWithId(req.body.mentorId)
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
            }else {
                return res.json({status_code:500, success: false, message:"Invalid request body."})
            }
        },
        function(callback) {
            secondPath = secondPath+"taskengagement-"+taskEngagementId
            aws.uploadToS3(secondPath, req.files.file)
                .then((response) => {
                    console.log("response: ",response)
                    fileUrl = response.key;
                    callback()
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
        function(callback) {
            try {
                let submissions = { fileUrl: fileUrl ,
                    description : description,
                    submittedBy : uploadedBy
                  };
                TaskEngagementRepo.updateSubmissionArray(taskEngagementId, submissions)
                    .then((taskEngagementFound) => {
                        if(taskEngagementFound) {
                            callback()
                        }else {
                            return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        callback(err)
                    })
            }catch(e) {
                console.log(e)
            }
        },
        function(callback) {
            TaskEngagementRepo.update(taskEngagementId, {status:"inprogress"})
                .then((taskEngagementFound) => {
                    if(taskEngagementFound) {
                        callback()
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
        function(callback) {
            // MENTEE UPLOADS A FILE TO THE TASK
            if(uploadedBy=="user") {
                // let menteeUploadFile = {
                //     // Email params
                //     to:menteeEmail,
                //     name: menteeName.capitalize(),
                //     subject: 'Your file attachment has been added successfully',
                //     html: "Dear " +  menteeName.capitalize() +  ",<br/><br/>We noticed that you recently uploaded a file attachment to your task. This has been added successfully & your mentor has been notified to review this.<br/><br/>Task Name: " +taskName+ "<br/><br/>Please make sure you leave a rating for the mentor, based on your experience.Please login to codediy.com to rate.<br/><br/>We hope you’re satisfied with the experience taking the challenge and interacting with the mentor on this task. Please feel free to write to " +adminEmail+ " if you have any questions or need any assistance.<br/><br/>Regards,<br/>CodeDIY Team"
                // }
                // emailService.sendMail(menteeUploadFile, function(err, response) {
                //     if(err) {
                //         console.log("email not sent")
                //         callback()
                //     }
                //     if(response.code=='success') {
                //        callback()
                //     }else {
                //         console.log("email not sent")
                //         callback()
                //     }
                // })

                //using send grid
                const messages = {
                    to: menteeEmail,
                    from: "vinit.webmigrates@gmail.com",
                    subject: "Your file attachment has been added successfully",
                    text: "Your file attachment has been added successfully",
                    html: "Dear " +  menteeName.capitalize() +  ",<br/><br/>We noticed that you recently uploaded a file attachment to your task. This has been added successfully & your mentor has been notified to review this.<br/><br/>Task Name: " +taskName+ "<br/><br/>Please make sure you leave a rating for the mentor, based on your experience.Please login to codediy.com to rate.<br/><br/>We hope you’re satisfied with the experience taking the challenge and interacting with the mentor on this task. Please feel free to write to " +adminEmail+ " if you have any questions or need any assistance.<br/><br/>Regards,<br/>CodeDIY Team"
                };
                sgSendMail.sendgridMail(messages, function (err, response) {
                    if (err){
                        callback()
                    } else {
                        callback()
                    }
                });
            }else {
                callback()
            }
        },
        function(callback) {
            // MENTEE UPLOADS A FILE TO THE TASK
            if(uploadedBy=="user") {
                // let mentorNotify = {
                //     // Email params
                //     to:mentorEmail,
                //     name: mentorName.capitalize(),
                //     subject: 'A file attachment has been uploaded to the task you’re reviewing',
                //     html: "Dear " +  mentorName.capitalize() +  ",<br/><br/>We noticed that your mentee recently uploaded a file attachment to the task you are reviewing. Please login to codediy.com to check this out, review the progress on your task and offer necessary guidance to the mentee. You can rate the mentee, post the completion of the task.<br/><br/>Task Name: " +taskName+ "<br/><br/>Please make sure you leave a rating for the mentee based on mentee’s overall performance during the task.<br/><br/>We hope you’re satisfied with the experience assisting the mentee with the challenge. Please feel free to write to " +adminEmail+ " if you have any questions or need any assistance.<br/><br/>Regards,<br/>CodeDIY Team"
                // }
                // emailService.sendMail(mentorNotify, function(err, response) {
                //     if(err) {
                //         console.log("email not sent")
                //         callback()
                //     }
                //     if(response.code=='success') {
                //        callback()
                //     }else {
                //         console.log("email not sent")
                //         callback()
                //     }
                // })

                const messages = {
                    to: mentorEmail,
                    from: "vinit.webmigrates@gmail.com",
                    subject: "A file attachment has been uploaded to the task you’re reviewing",
                    text: "A file attachment has been uploaded to the task you’re reviewing",
                    html: "Dear " +  mentorName.capitalize() +  ",<br/><br/>We noticed that your mentee recently uploaded a file attachment to the task you are reviewing. Please login to codediy.com to check this out, review the progress on your task and offer necessary guidance to the mentee. You can rate the mentee, post the completion of the task.<br/><br/>Task Name: " +taskName+ "<br/><br/>Please make sure you leave a rating for the mentee based on mentee’s overall performance during the task.<br/><br/>We hope you’re satisfied with the experience assisting the mentee with the challenge. Please feel free to write to " +adminEmail+ " if you have any questions or need any assistance.<br/><br/>Regards,<br/>CodeDIY Team"
                };
                sgSendMail.sendgridMail(messages, function (err, response) {
                    if (err){
                        callback()
                    } else {
                        callback()
                    }
                });
            }else {
                callback()
            }
        }
    ], function(err, result) {
		if(err) {
			return res.json({status_code:500, success: false, message:internalServerError, Error: err})
		}else {
			return res.json({status_code:200, success: true, location: fileUrl, message:'Upload Success.'})
		}
	})
}

exports.discussion = function(req, res, next) {
    //Generic Validation
    req.assert('taskEngagementId', 'taskEngagementId field can not be empty.').notEmpty();
    req.assert('postedBy', 'postedBy field can not be empty.').notEmpty();
    req.assert('description', 'description field can not be empty.').notEmpty();


    if((req.body.postedBy).toLowerCase()== "user") {
        req.assert('userId', 'userId field can not be empty.').notEmpty();
    }
    if((req.body.postedBy).toLowerCase()== "mentor") {
        req.assert('mentorId', 'mentorId field can not be empty.').notEmpty();
    }
	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, success:false, message:errors})
	}

	// Request Data
    const taskEngagementId = req.body.taskEngagementId;
    const postedBy = req.body.postedBy;
    const description = req.body.description;
    let fileUrl = req.body.fileUrl == undefined && req.body.fileUrl == null ? null : req.body.fileUrl

    async.waterfall([
        function(callback) {
            TaskEngagementRepo.findTaskEngagementWithId(taskEngagementId)
                .then((taskEngagementFound) => {
                    if(taskEngagementFound) {
                        if(postedBy=="user") {
                            taskEngagementFound.user._id==req.body.userId ? callback() :
                                res.json({status_code:404, success: false, message:'users does not match.'})
                        }else if(postedBy=="mentor") {
                            taskEngagementFound.mentor._id==req.body.mentorId ? callback() :
                                res.json({status_code:404, success: false, message:'mentor does not match.'})
                        } else {
                            return res.json({status_code:500, success: false, message:internalServerError, Error: err})
                        }

                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
		function(callback) {
			if(postedBy=="user") {
                userRepo.findUserWithId(req.body.userId)
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
            }
            else if(postedBy=="mentor") {
                mentorRepo.findMentorWithId(req.body.mentorId)
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
            }else {
                return res.json({status_code:500, success: false, message:"Invalid request body."})
            }
        },
        function(callback) {
            try {
                let discussions = { fileUrl: fileUrl ,
                    description : description,
                    postedBy : postedBy
                  };
                TaskEngagementRepo.updateDiscussionArray(taskEngagementId, discussions)
                    .then((taskEngagementFound) => {
                        if(taskEngagementFound) {
                            callback()
                        }else {
                            return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        callback(err)
                    })
            }catch(e) {
                console.log(e)
            }
        },
        function(callback) {
            TaskEngagementRepo.update(taskEngagementId, {status:"inprogress"})
                .then((taskEngagementFound) => {
                    if(taskEngagementFound) {
                        callback()
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
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
			return res.json({status_code:200, success: true, message:'new discussion post added.'})
		}
	})
}
exports.userTasks = function(req, res, next) {
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
			TaskEngagementRepo.userTasks(id)
                .then((result) => {
                    if(result) {
                        callback(null, result)
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid user id.'})
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
			return res.json({status_code:200, success: true, result: result, message:'Task engagement history.'})
		}
	})
}

exports.mentorTasks = function(req, res, next) {
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
                    console.log(err)
                    callback(err)
                })
        },
        function(callback) {
			TaskEngagementRepo.mentorTasks(id)
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
			return res.json({status_code:200, success: true, result: result, message:'Task engagement history.'})
		}
	})
}

exports.taskEngagementDetail = function(req, res, next) {
    req.assert('id', 'taskEngagementId field can not be empty.').notEmpty();

    const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	const data = req.user
	// Request Data
    const taskEngagementId = req.params.id;
    TaskEngagementRepo.findTaskEngagementWithId(taskEngagementId)
        .then((taskEngagementFound) => {
            if(taskEngagementFound) {
                if((data._id.toString() === taskEngagementFound.user._id.toString()) || (data._id.toString() === taskEngagementFound.mentor.user._id.toString())){
                    if(taskEngagementFound.isAnonymous==true) {
                        let userId = taskEngagementFound.user._id;
                        delete taskEngagementFound.user;
                        taskEngagementFound.user=userId;
                        return res.json({status_code:200, success: true, result: taskEngagementFound, message:'Task engagement details.'})
                    }else {
                        return res.json({status_code:200, success: true, result: taskEngagementFound, message:'Task engagement details.'})
                    }
                }else {
                    return res.json({status_code:401, success: false, message:'Only Mentors or Mentees of a Task Engagement can view the details'})
                }
            }else {
                return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
            }
        })
        .catch(err => {
            return res.json({status_code:500, success: false, message:internalServerError, Error: err})
        })
}

exports.taskReviewDetail = function(req, res, next) {
    req.assert('id', 'taskEngagementId field can not be empty.').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        return res.send({status_code:400, status:'failure', message:errors})
    }
    const data = req.user;
    // Request Data
    const taskEngagementId = req.params.id;
    TaskEngagementRepo.findTaskEngagementWithId(taskEngagementId)
        .then((taskEngagementFound) => {
            if(taskEngagementFound) {
                if((data._id.toString() === taskEngagementFound.user._id.toString()) || (data._id.toString() === taskEngagementFound.mentor.user._id.toString())){
                    if(taskEngagementFound.task.review) {
                        return res.json({status_code:200, success: true, result: taskEngagementFound.task.review, message:'Task engagement details.'})
                    }else {
                        return res.json({status_code:401, success: false, message:'cannot found data'})
                    }
                }else {
                    return res.json({status_code:401, success: false, message:'Only Mentors or Mentees of a Task Engagement can view the details'})
                }
            }else {
                return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
            }
        })
        .catch(err => {
            return res.json({status_code:500, success: false, message:internalServerError, Error: err})
        })
};

exports.endTask = function(req, res, next) {
    const data = req.user;
    req.assert('taskEngagementId', 'taskEngagementId field can not be empty.').notEmpty();
    req.assert('rating', 'rating field can not be empty.').notEmpty();
    req.assert('taskCompletionReason', 'taskCompletionReason field can not be empty.').notEmpty();
	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
    const taskEngagementId = req.body.taskEngagementId;

    let mentorId = null;
    let userId = null;

    // email prop
    let  menteeEmail = null;
    let  menteeName = null;

    let mentorUserId = null;
    let mentorEmail = null;
    let mentorName = null;
    let taskName = null;
    const dataToBeUpdated = {
        taskCompletionReason: req.body.taskCompletionReason,
        status: "completed",
        endDate: Date.now(),
        rating: {
            user2mentor: req.body.rating
        },
        // comment: {
        //     user2mentor: req.body.comment
        // },
        feedback: {
            userFeedback: req.body.feedback
        },
    }
    async.waterfall([
        function(callback) {
            if( req.body.rating >=0 &&  req.body.rating <= 5) {
                callback()
            }else {
                return res.json({status_code:406, success: false, message:'Rating must be in the range of 0 to 5.'})
            }
        },
        function(callback) {
            TaskEngagementRepo.findTaskEngagementWithId(taskEngagementId)
                .then((taskEngagementFound) => {
                    if(taskEngagementFound) {

                        mentorId = taskEngagementFound.mentor._id;
                        userId = taskEngagementFound.user._id;

                        taskName = taskEngagementFound.task.name.capitalize();
                        menteeEmail = taskEngagementFound.user.email;
                        menteeName = taskEngagementFound.user.firstName.capitalize();
                        console.log(menteeEmail, menteeName)

                        mentorEmail = taskEngagementFound.mentor.user.email;
                        mentorName = taskEngagementFound.mentor.user.firstName.capitalize();
                        console.log(mentorEmail, mentorName)

                        if(taskEngagementFound.status == "completed") {
                            res.json({status_code:404, success: false, message:'Task is already completed.'})
                        }
                        else if(taskEngagementFound.user._id == req.body.userId ) {
                            res.json({status_code:404, success: false, message:'users does not match.'})
                        }
                        else {
                            callback()
                        }
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
        function(callback) {
            userRepo.findUserWithId(userId)
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
            mentorRepo.findMentorWithId(mentorId)
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
            TaskEngagementRepo.update(taskEngagementId, dataToBeUpdated)
                .then((taskEngagementFound) => {
                    if(taskEngagementFound) {
                        callback()
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
        function(callback) {
            userRepo.removeActiveTask(userId, taskEngagementId)
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
            mentorRepo.removeActiveTask(mentorId, taskEngagementId)
                .then((mentorFound) => {
                    if(mentorFound) {
                        callback()
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid mentor id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
        function(callback) {
            // MENTEE MARKS A TASK “COMPLETE”
            // let menteeMarksComplete = {
            //     // Email params
            //     to:menteeEmail,
            //     name: menteeName.capitalize(),
            //     subject: 'Your task has been closed successfully',
            //     html: "Dear " +  menteeName.capitalize() +  ",<br/><br/>We noticed that you recently marked your task “completed”. <br/><br/>Task Name: " +taskName+ "<br/><br/>Please make sure you leave a rating for the mentor, based on your experience.Please login to codediy.com to rate.<br/><br/>We hope you’re satisfied with the experience taking the challenge and interacting with the mentor on this task. Please feel free to write to " +adminEmail+ " if you have any questions or need any assistance.<br/><br/>Regards,<br/>CodeDIY Team"
            // }
            // emailService.sendMail(menteeMarksComplete, function(err, response) {
            //     if(err) {
            //         console.log("email not sent", err)
            //         callback()
            //     }
            //     if(response.code=='success') {
            //        callback()
            //     }else {
            //         console.log("email not sent")
            //         callback()
            //     }
            // })

        //    using send grid
            const messages = {
                to: menteeEmail,
                from: "vinit.webmigrates@gmail.com",
                subject: "Congrats! Your Task is now reviewed and closed by your Mentor.",
                text: "Congrats! Your Task is now reviewed and closed by your Mentor.",
                html: `Pls visit <a href='https://beta.codediy.io/task-engagement/${taskEngagementId}' target="_blank">https://beta.codediy.io/${taskEngagementId}</a> to view your Task Engagement  log for this task ${taskName}! with your Mentor.`
            };
            sgSendMail.sendgridMail(messages, function (err, response) {
                if (err){
                    console.log("mail error----->>>", err);
                    callback();
                } else {
                    callback();
                }
            });

        },
        function(callback) {
            // MENTOR IS NOTIFIED WHEN A TASK IS MARKED COMPLETED
            // let mentorNotifiedWhenCompleted= {
            //     // Email params
            //     to:mentorEmail,
            //     name: mentorName.capitalize(),
            //     subject: 'You’ve successfully completed reviewing a task',
            //     html: "Dear " +  mentorName.capitalize() +  ",<br/><br/>We noticed that your mentee recently marked the task you were reviewed “completed”. <br/><br/>Task Name: " +taskName+ "<br/><br/>Please make sure you leave a rating for the mentee based on mentee’s overall performance during the task.<br/><br/>We hope you’re satisfied with the experience assisting the mentee with the challenge. Please feel free to write to " +adminEmail+ " if you have any questions or need any assistance.<br/><br/>Regards,<br/>CodeDIY Team"
            // }
            // emailService.sendMail(mentorNotifiedWhenCompleted, function(err, response) {
            //     if(err) {
            //         console.log("email not sent", err)
            //         callback()
            //     }
            //     if(response.code=='success') {
            //        callback()
            //     }else {
            //         console.log("email not sent")
            //         callback()
            //     }
            // })

        //    using send grid
            const messages = {
                to: mentorEmail,
                from: "vinit.webmigrates@gmail.com",
                subject: "Congrats! You have a finished reviewing your mentee’s submissions for the task",
                text: "Congrats! You have a finished reviewing your mentee’s submissions for the task",
                html: `Hello ${mentorName.capitalize()} <br/><br/> Pls visit <a href='https://beta.codediy.io/mentor-task-details/${taskEngagementId}' target="_blank">https://beta.codediy.io/${taskEngagementId}</a> to view your Task Engagement log for this task ${taskName}! with your Mentee.<br/>Task completed: ${dataToBeUpdated.endDate || '-'}`
            };
            sgSendMail.sendgridMail(messages, function (err, response) {
                if (err){
                    console.log("mail error----->>>", err);
                    callback();
                } else {
                    callback();
                }
            });

        },
        function(callback) {
            TaskEngagementRepo.getAverageRatingofMentor(mentorId)
                .then((result) => {
                    if(result) {
                        callback(null, result[0].avg_rating_of_mentor)
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid mentor id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
        function(avg_rating_of_mentor, callback) {
            mentorRepo.update(mentorId, {averageRating: avg_rating_of_mentor })
                .then((result) => {
                    if(result) {
                        callback()
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid mentor id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        }
    ], function(err, result) {
		if(err) {
			return res.json({status_code:500, success: false, message:internalServerError, Error: err})
		}else {
		    if(req.body.feedback){
                console.log(`${data.email} is commenting - ${req.body.feedback}. ${new Date()}:`);
                Sentry.addBreadcrumb({
                    category: "auth",
                    message: `${data.email} is commenting - ${req.body.feedback}. ${new Date()}:`,
                    level: Sentry.Severity.Info,
                });
            }
            console.log(`${data.email} is Closing the Task -${req.body.taskEngagementId}. ${new Date()}:`);
            Sentry.addBreadcrumb({
                category: "auth",
                message: `${data.email} is Closing the Task -${req.body.taskEngagementId}. ${new Date()}:`,
                level: Sentry.Severity.Info,
            });
			return res.json({status_code:200, success: true, message:'Task is completed successfully.'})
		}
	})
}

// Rating - Mentor to mentee
exports.mentorToUserRating = function(req, res, next) {
    req.assert('taskEngagementId', 'taskEngagementId field can not be empty.').notEmpty();
    // req.assert('rating', 'rating field can not be empty.').notEmpty();
	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
    const taskEngagementId = req.body.taskEngagementId;
    let userId = null;

    const dataToBeUpdated = {
        rating: {
            mentor2user: req.body.rating || 0
        },
        feedback: {
            mentorFeedback: req.body.feedback
        },
        comment: {
            mentor2user: req.body.comment
        },
        mentor2userReview: req.body.isReview || false
    };
    async.waterfall([
        function(callback) {
            if (req.body.rating){
                if( req.body.rating >=0 &&  req.body.rating <= 5) {
                    callback()
                }else {
                    return res.json({status_code:406, success: false, message:'Rating must be in the range of 0 to 5.'})
                }
            } else {
                callback();
            }
        },
        function(callback) {
            TaskEngagementRepo.findTaskEngagementWithId(taskEngagementId)
                .then((taskEngagementFound) => {
                    if(taskEngagementFound) {
                        userId = taskEngagementFound.user._id;
                        dataToBeUpdated.feedback.userFeedback=taskEngagementFound.feedback.userFeedback;
                        dataToBeUpdated.rating.user2mentor=taskEngagementFound.rating.user2mentor;
                        console.log("------------", dataToBeUpdated);
                        if(taskEngagementFound.status == "completed") {
                            callback()
                        }else {
                            res.json({status_code:404, success: false, message:'You can give the rating after completion of the task.'})
                        }
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
        function(callback) {
            TaskEngagementRepo.update(taskEngagementId, dataToBeUpdated)
                .then((taskEngagementFound) => {
                    if(taskEngagementFound) {
                        callback()
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid task engagement id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
        function(callback) {
            TaskEngagementRepo.getAverageRatingofUser(userId)
                .then((result) => {
                    if(result) {
                        callback(null, result[0].avg_rating_of_user)
                    }else {
                        return res.json({status_code:404, success: false, message:'Invalid mentor id.'})
                    }
                })
                .catch(err => {
                    console.log(err)
                    callback(err)
                })
        },
        function(avg_rating_of_user, callback) {
            userRepo.update(userId, {averageRating: avg_rating_of_user })
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
        }
    ], function(err, result) {
		if(err) {
			return res.json({status_code:500, success: false, message:internalServerError, Error: err})
		}else {
			return res.json({status_code:200, success: true, message:'You have Successfully rated the user.'})
		}
	})
}

exports.taskEngagementList = async function(req, res){
    await TaskEngagementRepo.listTaskEngagement().then(response =>{
        if (response){
            res.status(200).send({success: true, result: response});
        } else {
            res.status(400).send({success: false,  msg: "something went wrong"});
        }
    }).catch(err =>{
        console.log(err);
        res.status(500).send({success: false, msg: "internal server error"});
    })
};

exports.createGmeetLink = async function(req, res){
    const id = req.params.id;
    const data = req.body.gMeetUrl;
    console.log("req.body------------", req.body, id);
    await TaskEngagementRepo.createGMeet(id, data).then(response =>{
        if (response){
            res.status(200).send({success: true, result: response});
        } else {
            res.status(400).send({success: false,  msg: "something went wrong"});
        }
    }).catch(err =>{
        console.log(err);
        res.status(500).send({success: false, msg: "internal server error"});
    })
};

exports.isPurchasedOrNot = async function (req, res) {
    try {
        const {taskID, userID} = req.body;
        const data = await taskEngage.find({user: userID, task: taskID})
        if (data.length) {
            res.status(200).send({success: true, result: true});
        } else {
            res.status(200).send({success: true, result: false});
        }
    } catch (err) {
        res.status(500).send({success: false, msg: "internal server error"});
    }
};

exports.taskMentorReviewDetail = async function (req, res) {
    try {
        const id = req.params.id;
        const data = await taskEngage.findOne({_id : id}).populate({path: 'task'});
        if(data.task){
            const review = data.task.review || [];
            return res.json({status_code:200, success: true, result: review, message:'Task engagement details.'})
        }else {
            return res.json({status_code:401, success: false, message:'cannot found data'})
        }
    }catch (err) {
        res.status(500).send({success: false, msg: "internal server error"});
    }
};

