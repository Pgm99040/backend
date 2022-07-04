
'use strict';
// load the things we need
const mongoose = require('mongoose');
const moment = require('moment');
const async = require('async');
const jwt = require('jwt-simple');
const jwtGenerate = require("jsonwebtoken");
// Required services ====================================
const configData = require('../../config/db');
const config = require('../../config');
const tokens = require('../models/tokens');
const jwtTokenSecret = configData.jwtSecretKey;
const clientId = configData.googleClientId;
const errorsUtil = require('../../utils/errors')
const aws = require('../../services/aws')
// Required repos ======================================
const userRepo = require('../repository/user');
const User = require("../models/user")
const sgSendMail = require("../../services/mail");
const mentorRepo = require('../repository/mentor');
const paymentRepo = require('../repository/payment');
const predefinedTaskRepo = require('../repository/predefinedtask');
const TaskEngagementRepo = require('../repository/taskengagement');
const {OAuth2Client} = require("google-auth-library");
const Sentry = require("@sentry/node");
// Errors
const internalServerError = 'Internal server Error';
const noMentorsFoundErrorMsg = "No mentors available. Please try again later";

//email
const emailService = require('../../services/mail');
let adminEmail = config.adminEmail;
// Generic Functions;
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * POST /userLogin
 */
// google auth login
const client = new OAuth2Client(clientId);

const createDefaultUsername=(firstname,lastname)=>{
  let random = Math.random().toString(36).slice(2)
  return firstname+"-"+lastname+"-"+random

};

exports.googleLogin = (req, res) =>{
  const {authToken, email, firstName, lastName, profilePicUrl, timeZone} = req.body;
  console.log("req.body", req.body);
  client.verifyIdToken({idToken: authToken, audience: clientId}).then(async (response) =>{
    const { email_verified, email, name } = response.payload;
    console.log(email_verified, email);
    if(email_verified) {
      try{
        let object = null;
        const isExists = await User.findOne({email});
        if (isExists !== null) {
          if (isExists && isExists.status){
            const token = jwtGenerate.sign({email, role: "user"}, jwtTokenSecret, {expiresIn: '30d'});
            object = await User.findOneAndUpdate({email}, {socialLoginInfo: {authenticatingSite: "google", authToken: token}, timeZone});
          }
        } else {
          const token = jwtGenerate.sign({email, role: "user"}, jwtTokenSecret, {expiresIn: '30d'});
          let signIndata = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            profilePicUrl: profilePicUrl,
            lastLoggedIn: Date.now(),
            timeZone,
            isLoggedIn: true,
            userName: `${firstName}${lastName}`,
            socialLoginInfo: {
              authenticatingSite: 'google+',
              authToken: token,
            },
            password:"12345"
          };
          object = await User.create(signIndata);
        }
        if (object){
          const result = {
            _id: object._id,
            socialLoginInfo: object.socialLoginInfo,
            education: object.education,
            status: object.status,
            isMentor: object.isMentor,
            isAnonymous: object.isAnonymous,
            isProfileUpdated: object.isProfileUpdated,
            dateOfBirth: object.dateOfBirth,
            aboutMe: object.aboutMe,
            profilePicUrl: object.profilePicUrl,
            timeZone: object.timeZone,
            isLoggedIn: object.isLoggedIn,
            firstName: object.firstName,
            lastName: object.lastName,
            email: object.email,
            userName: object.userName,
            mentor: object. mentor
          };
          res.status(200).send({success: true, result});
        } else{
          res.status(400).send({msg: "something went wrong", success: false});
        }
      } catch (e) {
        console.log("some error occur", e);
        res.status(400);
      }
    }
  }).catch(e =>{
    console.log("error--->", e);
  })
};

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

exports.userLogin = function (req, res, next) {
  // Generic validation
  req.assert('firstName', 'firstName name field can not be empty.').notEmpty();
  req.assert('lastName', 'lastName name field can not be empty.').notEmpty();
  req.assert('email', 'email name field can not be empty.').notEmpty();
  req.assert('platform', 'platform field can not be empty.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }

  // Request Data
  let firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const profilePicUrl = req.body.profilePicUrl;
  const socialLoginInfo = {
    authToken: req.body.authToken,
    authenticatingSite: req.body.authenticatingSite,
  };
  const platform = req.body.platform;



  let signUpdata = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    profilePicUrl: profilePicUrl,
    preferredLanguages: [{ lang: "english", fluency: "Fluent" }],
    isLoggedIn: true,
    lastLoggedIn: Date.now()
  }

  const loginResponse = {
    firstName: '',
    lastName: '',
    email: '',
    userName:'',
    profilePicUrl: '',
    token: '',
    mentorId: null
  }

  //MENTEE REGISTRATION
  let menteeRegistration = {
    //Email Param
    to: email,
    name: firstName.capitalize(),
    subject: 'Welcome to CodeDIY!',
    html: "Dear " + firstName.capitalize() + ",<br/><br/>Welcome to CodeDIY! Start learning coding through practice & get timely reviews by verified mentors. To get started, you could take one task at a time, answer the challenge & upload answers. Your answer will be reviewed by a mentor who’s available on the platform. Please login to codediy.com to benefit from the platform as a mentee.<br/><br/>Your task history can be tracked from your profile section.<br/><br/>Please feel free to write to " + adminEmail + " if you have any questions or need any assistance.<br/><br/>Hoping to see you around, learning valuable skills.<br/><br/>Regards,<br/>CodeDIY Team"
  }
  let data = {};
  async.waterfall([
    function (callback) {
      userRepo.findUserWithEmail(email)
          .then((userFound) => {
            if (userFound) {
              callback()
            } else {
              emailService.sendMail(menteeRegistration, function (err, response) {
                if (err) {
                  console.log("email not sent", err)
                  callback()
                }
                if (response.code == 'success') {
                  callback()
                } else {
                  console.log("email not sent to ", email)
                  callback()
                }
              })
            }
          })
          .catch((err) => {
            callback(err)
          })
    },
    function (callback) {
      userRepo.findUserWithEmail(email)
          .then((userFound) => {
            if (userFound) {

              if (userFound.isProfileUpdated) {
                data = {
                  profilePicUrl: profilePicUrl, socialLoginInfo: socialLoginInfo,
                  isLoggedIn: true, lastLoggedIn: Date.now(),

                }
              } else {

                data = {
                  firstName: firstName, lastName: lastName,
                  //userName:username,
                  profilePicUrl: profilePicUrl, socialLoginInfo: socialLoginInfo,
                  isLoggedIn: true, lastLoggedIn: Date.now()
                }
              }
              // if(userFound.isLoggedIn==true) {
              // 	return res.json({status_code:408, success: false, message:'Please logout from other devices.'})
              // }else {
              userRepo.update(userFound._id, data)
                  .then((result) => {
                    callback();
                  })
                  .catch((err) => {
                    callback(err)
                  })
              //}

            } else {
              let username = createDefaultUsername(firstName,lastName)
              signUpdata["userName"] = username
              userRepo.save(signUpdata)
                  .then((newUser) => {
                    callback();
                  })
                  .catch((err) => {
                    callback(err)
                  })
            }
          })
          .catch(err => {
            console.log(err)
            callback(err)
          })
    },
    function (callback) {
      userRepo.findUserWithEmail(email)
          .then((userFound) => {
            if (userFound) {
              var resp = loginResponse;
              resp._id = userFound._id;
              resp.firstName = userFound.firstName;
              resp.lastName = userFound.lastName;
              resp.email = userFound.email;
              resp.userName = userFound.userName;
              resp.isMentor = userFound.isMentor;
              resp.activeTaskCount = userFound.activeTaskCount;
              //console.log(userFound.activeTasks)
              try {
                if (userFound.activeTasks.length > 0) {
                  resp.activeTasks = userFound.activeTasks[0].task._id;
                  resp.taskEngagements = userFound.activeTasks[0]._id;

                } else {
                  resp.activeTasks = [];
                  resp.taskEngagements = []
                }
              } catch (e) {
                resp.activeTasks = [];
              }
              //console.log(userFound, "USERFOUND")

              resp.isLoggedIn = userFound.isLoggedIn;
              if (userFound.isMentor && userFound.mentor.isApproved) {
                resp.mentorId = userFound.mentor._id;
                resp.IsMentorApproved = true;
              } else {
                resp.IsMentorApproved = false;
              }
              resp.token = ((typeof token == 'undefined') ? tokens.createNewToken('user', userFound, platform) : token);
              if (typeof resp.profilePicUrl != null) {
                resp.profilePicUrl = userFound.profilePicUrl;
              }
              resp["credits"] = userFound.credits
              callback(null, resp)
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid email.' })
            }
          })
          .catch(err => {
            console.log(err)
            callback(err)
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

/**
 * POST /apu/v1/becomeMentor
 */
exports.becomeMentor = function (req, res, next) {
  // Generic validation
  req.assert('userId', 'userId field can not be empty.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }

  // Request Data
  const userId = req.params.userId;
  console.log("userId", userId);

  async.waterfall([
    function (callback) {
      userRepo.findUserWithId(userId)
          .then((userFound) => {
            if (userFound) {
              //console.log(userFound, "Userfound")
              if (userFound.isMentor) {
                return res.json({ status_code: 208, success: false, message: 'You have already requested.' })
              }
              else {
                let mentorRegistration = {
                  // Email params
                  to: userFound.email,
                  name: userFound.firstName.capitalize(),
                  subject: 'Welcome to CodeDIY!',
                  html: "Dear " + userFound.firstName.capitalize() + ",<br/><br/>Welcome to CodeDIY! Start guiding budding programmers learning coding through practice & earn for every task you review. CodeDIY will automatically assign a mentor, to tasks that are being taken by mentees, based on mentors’ availability. You’ll be notified by email when you’re assigned to a mentee. Please login to codediy.com to contribute as a mentor.<br/><br/>Your mentor fee will be transferred to your account, by the platform admin on a monthly basis. Your earning history can be tracked from your profile section.<br/><br/>Please feel free to write to " + adminEmail + " if you have any questions or need any assistance.<br/><br/>Regards,<br/>CodeDIY Team"
                }
                emailService.sendMail(mentorRegistration, function (err, response) {
                  if (err) {
                    console.log("email not sent", err)
                    callback()
                  }
                  if (response.code == 'success') {
                    callback()
                  } else {
                    //console.log("email not sent to ", email)
                    callback()
                  }
                })
              }
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
            }
          })
          .catch(err => {
            callback(err)
          })
    },
    function (callback) {
      mentorRepo.save({ user: userId })
          .then((newMentor) => {
            if (newMentor) {
              callback(null, newMentor._id)
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
            }
          })
          .catch(err => {
            callback(err)
          })
    },
    function (mentorId, callback) {
      userRepo.update(userId, { isMentor: true, mentor: mentorId })
          .then((userFound) => {
            if (userFound) {
              callback(null, userFound)
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
            }
          })
          .catch(err => {
            callback(err)
          })
    },
  ], function (err, result) {
    if (err) {
      return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
    } else {
      return res.json({ status_code: 200, success: true, result: result, message: 'Request accepted and the same will be processed soon.' })
    }
  })
};

/**
 * POST /apu/v1/profileUpdate
 */
exports.profileUpdate = function (req, res, next) {
  // Generic validation
  req.assert('userId', 'userId field can not be empty.').notEmpty();

  /*req.assert('firstName', 'firstName field can not be empty.').notEmpty();
  req.assert('lastName', 'lastName field can not be empty.').notEmpty();

  req.assert('country', 'country field can not be empty.').notEmpty();
  req.assert('city', 'city field can not be empty.').notEmpty();
  req.assert('zipCode', 'zipCode field can not be empty.').notEmpty();

  req.assert('company', 'company field can not be empty.').notEmpty();
  req.assert('companyLocation', 'companyLocation field can not be empty.').notEmpty();
  req.assert('currentFieldOfStudy', 'currentFieldOfStudy field can not be empty.').notEmpty();
  req.assert('currentWorkTitle', 'currentWorkTitle field can not be empty.').notEmpty();

  req.assert('gender', 'gender field can not be empty.').notEmpty();
  req.assert('designation', 'designation field can not be empty.').notEmpty();
  req.assert('dateOfBirth', 'dateOfBirth field can not be empty.').notEmpty();
  req.assert('aboutMe', 'aboutMe field can not be empty.').notEmpty();

  req.assert('linkedInUrl', 'linkedInUrl field can not be empty.').notEmpty();
  req.assert('githubUrl', 'githubUrl field can not be empty.').notEmpty();*/

  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }
  const userId = req.body.userId;

  let preferLang = [];
  if (req.body.preferredLanguages){
    let arrayValue = req && req.body && req.body.preferredLanguages;
    arrayValue.forEach(ele =>{
      let langObj = {lang:`${ele}`, fluency: "Fluent"};
      preferLang.push(langObj);
    });
  }
  const data = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,

    country: req.body.country,
    city: req.body.city,
    zipCode: req.body.zipCode,

    company: req.body.company,
    companyLocation: req.body.companyLocation,
    currentFieldOfStudy: req.body.currentFieldOfStudy,
    currentWorkTitle: req.body.currentWorkTitle,

    gender: req.body.gender,
    designation: req.body.designation,
    dateOfBirth: req.body.dateOfBirth,
    aboutMe: req.body.aboutMe,

    linkedInUrl: req.body.linkedInUrl,
    githubUrl: req.body.githubUrl,
    expertise: req.body.expertise,
    preferredLanguages: preferLang,
    isProfileUpdated: true
  }

  async.waterfall([
    function (callback) {
      userRepo.findUserWithId(userId)
          .then((userFound) => {
            if (userFound) {
              callback()
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
            }
          })
          .catch(err => {
            callback(err)
          })
    },
    function (callback) {
      userRepo.update(userId, data)
          .then((newMentor) => {
            if (newMentor) {
              callback()
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
            }
          })
          .catch(err => {
            callback(err)
          })
    },
    function (callback) {
      userRepo.findUserWithId(userId)
          .then((userFound) => {
            if (userFound) {
              callback(null, userFound)
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
            }
          })
          .catch(err => {
            callback(err)
          })
    },
  ], function (err, result) {
    if (err) {
      return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
    } else {
      return res.json({ status_code: 200, success: true, result: result, message: 'Profile updates successfully.' })
    }
  })
}

var findDefautMentor = function (userId, taskId) {
  let newResult = []
  return new Promise(function (resolve, reject) {
    mentorRepo.getDefaultActiveMentors(userId, taskId)
        .then((mentorsArray) => {
          //console.log("findDefautMentor fun: ", mentorsArray)
          if (mentorsArray === undefined || mentorsArray.length == 0) {
            reject(noMentorsFoundErrorMsg)
          }
          if (mentorsArray.length > 1) {
            mentorsArray.map((obj) => {
              if (obj.user != userId) {
                newResult.push(obj)
              }
            })
            assignedMentor = findMentorWithMinActiveTask(newResult)
            typeof mentorsArray != null || typeof mentorsArray != undefined
                ? resolve(assignedMentor) : reject(noMentorsFoundErrorMsg);
          }
          if (mentorsArray.length == 1) {
            resolve(mentorsArray[0])
          }
        })
        .catch((err) => {
          console.log(err)
          reject(err)
        })
  })
}
var findSupportedLanguageMentors = function (mentorsArray, requestedLanguage) {
  let result = [];
  return new Promise(function (resolve, reject) {
    mentorsArray.map((mentor) => {
      mentor.user.preferredLanguages.map((language) => {
        if (language.lang.toLowerCase() === requestedLanguage.toLowerCase()) {
          result.push(mentor);
        }
      })
    })
    resolve(result);
  })

}
var findMentor = function (userId, preferredLanguage, taskId) {

  let newResult = []
  return new Promise(function (resolve, reject) {
    try {
      let assignedMentor = null;
      mentorRepo.getActiveMentors(userId, taskId)
          .then((mentorsArray) => {
            if (mentorsArray === undefined || mentorsArray.length == 0) {
              resolve(findDefautMentor(userId, taskId))
            }
            if (mentorsArray.length > 1) {
              mentorsArray.map((obj) => {
                if (obj.user._id != userId) {
                  newResult.push(obj)
                }
              })
              findSupportedLanguageMentors(newResult, preferredLanguage)
                  .then((supportedLanguageMentors) => {

                    if (supportedLanguageMentors.length == 1) {
                      supportedLanguageMentors[0].isLanguageSupportedMentor = true;
                      resolve(supportedLanguageMentors[0])
                    }
                    if (supportedLanguageMentors.length > 1) {

                      assignedMentor = findMentorWithMinActiveTask(supportedLanguageMentors || newResult);
                      assignedMentor.isLanguageSupportedMentor = true;
                      typeof assignedMentor != null || typeof assignedMentor != undefined
                          ? resolve(assignedMentor)
                          : resolve(findDefautMentor(userId));
                    } else {
                      assignedMentor = findMentorWithMinActiveTask(newResult)
                      assignedMentor.isLanguageSupportedMentor = false;
                      typeof assignedMentor != null || typeof assignedMentor != undefined
                          ? resolve(assignedMentor)
                          : resolve(findDefautMentor(userId));
                    }
                  })
            }
            else if (mentorsArray.length == 1) {
              resolve(mentorsArray[0])
            }
            else {
              resolve(findDefautMentor(userId))
            }
          })
          .catch((err) => {
            console.log(err)
            reject(err)
          })
    } catch (err) {
      console.log(err)
      reject(err)
    }
  });
}


function findMentorWithMinActiveTask(mentorsArray) {
  return mentorsArray.reduce((accumulator, currentValue) =>
      currentValue.activeTaskCount < accumulator.activeTaskCount ?
          currentValue : accumulator, mentorsArray[0]);
}

function findMentorsWithMinimumActiveTask(mentorsArray) {
  return mentorsArray.reduce((accumulator, currentValue) =>
      currentValue.activeTaskCount < accumulator.activeTaskCount ?
          currentValue : accumulator,mentorsArray[0]);
}

function findAvailableMentors(userId,mentorsArray)
{
  return mentorsArray.filter(mentor => (mentor.activeTaskCount < 6) || (userId.toString() !== mentor.user._id.toString()) )
}

exports.requestForTask = function (req, res, next) {
  const data = req.user
  console.log(`${data.email} is Purchasing the Task -${req.body.userId}. ${new Date()}:`);
  Sentry.addBreadcrumb({
    category: "auth",
    message: `${data.email} is Purchasing the Task -${req.body.userId}. ${new Date()}:`,
    level: Sentry.Severity.Info,
  });
  console.log("request ----->");
  // Generic validation
  // req.assert('userId', 'userId field can not be empty.').notEmpty();
  // req.assert('predefinedTaskId', 'predefinedTaskId field can not be empty.').notEmpty();
  // req.assert('isAnonymous', 'isAnonymous field can not be empty.').notEmpty();
  // req.assert('paymentStatus', 'paymentStatus field can not be empty.').notEmpty();
  // // req.assert('razorpayId', 'razorpayId field can not be empty.').notEmpty();
  // // req.assert('captured', 'captured field can not be empty.').notEmpty();
  // req.assert('taskType', 'taskType field can not be empty.').notEmpty();
  // //req.assert('preferredLanguage', 'preferredLanguage field can not be empty.').notEmpty();
  // //req.assert('paymentGateway', 'paymentGateway field can not be empty.').notEmpty();
  // req.assert('taskPrice', 'taskPrice field can not be empty.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }

  // Request Data
  const userId = req.body.userId;
  const predefinedTaskId = req.body.predefinedTaskId;
  const isAnonymous = req.body.isAnonymous;
  let isPaid = false;
  let taskType = req.body.taskType;

  let preferredLanguage = req.body.preferredLanguage || "english";

  let paymentData;

  if (req.body.taskPurchaseType === "credits") {
    paymentData = {
      user: userId,
      paymentStatus: req.body.paymentStatus,
      paymentGateway: req.body.paymentGateway || "razorpay",
      task: predefinedTaskId,
      credits: req.body.taskPrice,
      taskPurchaseType: "credits"
    }
  }
  else {
    if(req.body.paymentGateway === "razorpay")
    {
      paymentData = {
        user: userId,
        paymentStatus: req.body.paymentStatus,
        paymentGateway: "razorpay",
        task: predefinedTaskId,
        razorPay: {
          razorpayId: req.body.razorpayId,
          captured: req.body.captured
        },
        currency: req.body.taskPrice,
        taskPurchaseType: "currency"
      }
    }
    else{
      paymentData = {
        user: userId,
        paymentStatus: req.body.paymentStatus,
        paymentGateway:  "paypal",
        task: predefinedTaskId,
        paypal: {
          transactionId: req.body.transactionId,
          captured: req.body.captured
        },
        currency: req.body.taskPrice,
        taskPurchaseType: "currency"
      }
    }

  }

  let paymentId = null;
  let taskEngagementId = null;
  let selectedMentorId = req.body.selectedMentorId;

  let menteeEmail = null;
  let menteeName = null;

  let mentorUserId = req.body.mentorUserId;
  console.log("mentorUserId------>>>", mentorUserId)
  let mentorEmail = null;
  let mentorName = null;
  let taskName = null;
  let isLanguageSupportedMentor = false;
  let availCredits;
  async.waterfall([
    function (callback) {
      userRepo.findUserWithId(userId)
          .then((userFound) => {
            if (userFound) {
              menteeEmail = userFound.email;
              menteeName = userFound.firstName.capitalize();
              availCredits = userFound.credits;
              console.log("menteeEmail------------->>>>", menteeEmail);
              if (userFound.activeTaskCount === 0) {
                callback()
              } else {
                return res.json({
                  status_code: 403,
                  success: false,
                  message: 'Oops, Please complete the current task to proceed with the new task.'
                })
              }
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
            }
          })
          .catch(err => {
            callback(err)
          })
    },
    function (callback) {
      predefinedTaskRepo.findPredefinedTaskWithId(predefinedTaskId)
          .then((predefinedTaskFound) => {
            if (predefinedTaskFound) {
              taskName = predefinedTaskFound.name.capitalize();
              if (predefinedTaskFound.taskType === taskType) {
                callback()
              } else {
                return res.json({
                  status_code: 403,
                  success: false,
                  message: 'Oops, Something went wrong.'
                })
              }

            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid predefined Task Id.' })
            }
          })
          .catch((err) => {
            console.log(err);
            callback(err)
          })
    },
    //********Testing Purpose******** REMOVE THIS FUNCTION IN PRODUCITON*/
    // function(callback) {
    // 	mentorRepo.findAssignDefaultMentor()
    // 		.then((assignedMentor) => {
    // 			if(assignedMentor) {
    // 			console.log("Funciton: findAssignDefaultMentor",assignedMentor )
    // 			selectedMentorId = assignedMentor._id
    // 			mentorUserId = assignedMentor.user._id;
    // 			console.log("findAssignDefaultMentor: ", assignedMentor)
    // 			callback()
    // 			}else {
    // 				res.json({status_code:403, success: false, message: noMentorsFoundErrorMsg})
    // 			}
    // 		})
    // 		.catch((err) => {
    // 			console.log(err)
    // 			callback(err);
    // 		})
    // },
    //************************ Realtime mentor assignment: uncomment this in production
    // function (callback) {
    // 	findMentor(userId, preferredLanguage)
    // 		.then((assignedMentor) => {
    // 			if (assignedMentor.isLanguageSupportedMentor != undefined && assignedMentor.isLanguageSupportedMentor != null) {
    // 				if (assignedMentor.isLanguageSupportedMentor) {
    // 					isLanguageSupportedMentor = true;
    // 				}
    // 			}
    // 			selectedMentorId = assignedMentor._id
    // 			mentorUserId = assignedMentor.user;
    // 			//console.log("final mentor: ", assignedMentor)
    // 			typeof assignedMentor == undefined || typeof assignedMentor == null
    // 				? res.json({ status_code: 403, success: false, message: noMentorsFoundErrorMsg })
    // 				: assignedMentor.user == userId
    // 					? res.json({ status_code: 403, success: false, message: noMentorsFoundErrorMsg })
    // 					: callback()
    // 		})
    // 		.catch(err => {
    // 			console.log(err)
    // 			return res.json({ status_code: 403, success: false, message: noMentorsFoundErrorMsg })
    // 		})
    // },
    function (callback) {
      if (req.body.taskPurchaseType === "credits") {
        if (availCredits >= req.body.taskPrice) {
          isPaid = true;
          paymentData.mentor = selectedMentorId;
          paymentRepo.save(paymentData)
              .then((newPayment) => {
                paymentId = newPayment._id;
                paymentRepo.updateCredits(-(req.body.taskPrice), userId)
                    .then(() => {
                      callback()
                    })
                    .catch((err) => {
                      console.log(err);
                      callback(err)
                    })
              })
              .catch((err) => {
                console.log(err);
                callback(err)
              })
        }
        else {
          return res.json({ status_code: 504, success: false, message: "No enough available credits" })
        }
      }
      else {
        if ((taskType.toLowerCase() == "paid")) {
          if ((paymentData.paymentStatus).toLowerCase() == 'success') {
            isPaid = true;
            paymentData.mentor = selectedMentorId;
            paymentRepo.save(paymentData)
                .then((newPayment) => {
                  paymentId = newPayment._id;
                  callback()
                })
                .catch((err) => {
                  console.log(err)
                  callback(err)
                })
          } else {
            return res.json({ status_code: 500, success: false, message: "Payment failure.. " })
          }
        } else {
          callback()
        }
      }
    },
    function (callback) {
      let taskEngagementData = {
        user: userId,
        mentor: selectedMentorId,
        task: predefinedTaskId,
        payment: paymentId,
        isPaid: isPaid,
        isAnonymous: isAnonymous,
        IsMentorAssigned: true,
        startDate: Date.now(),
        taskType: taskType
      }
      TaskEngagementRepo.save(taskEngagementData)
          .then((result) => {
            taskEngagementId = result._id;
            callback()
          })
          .catch(err => {
            console.log(err)
            callback(err)
          })
    },
    function (callback) {
      //console.log("userRepo.mapTask", userId, taskEngagementId)
      userRepo.mapTask(userId, taskEngagementId)
          .then((result) => {
            callback()
          })
          .catch(err => {
            console.log(err)
            callback(err)
          })
    },
    function (callback) {
      console.log("mentorRepo.mapTask")
      mentorRepo.mapTask(selectedMentorId, taskEngagementId)
          .then((result) => {
            callback()
          })
          .catch(err => {
            //console.log(err)
            callback(err)
          })
    },
    function (callback) {
      paymentRepo.update({ _id: paymentId }, { taskEngagement: taskEngagementId })
          .then((result) => {
            callback()
          })
          .catch(err => {
            console.log(err)
            callback(err)
          })
    },
    function (callback) { // user email
      // let menteeAssignedMentor = {
      //   // Email params
      //   to: menteeEmail,
      //   name: menteeName.capitalize(),
      //   subject: 'A mentor has been assigned to review your task',
      //   html: "Dear " + menteeName.capitalize() + ",<br/><br/>We noticed that you recently got started with a task & uploaded an answer. We’ve assigned a mentor to review your answer and guide you through this challenge. Please login to codediy.com to check the progress on your task.<br/><br/>Task Name: " + taskName + "<br/><br/>Please feel free to write to " + adminEmail + " if you have any questions or need any assistance.<br/><br/>Regards,<br/>CodeDIY Team"
      // }
      // emailService.sendMail(menteeAssignedMentor, function (err, response) {
      //   if (err) {
      //     console.log(err)
      //     callback()
      //   }
      //   if (response.code == 'success') {
      //     callback()
      //   } else {
      //     console.log("email not sent")
      //     callback()
      //   }
      // })

    //  send grid api
      const messages = {
        to: menteeEmail,
        from: "vinit.webmigrates@gmail.com",
        subject: "Congrats! Your mentor is ready to engage & review your task submission",
        text: "Congrats. Your mentor is ready to engage & review your task submission",
        html: `Pls visit <a href='https://beta.codediy.io/task-engagement/${taskEngagementId}' target="_blank">https://beta.codediy.io/${taskEngagementId}</a> to engage with your Mentor for this task ${taskName}!`
        // html: "Dear " + menteeName.capitalize() + ",<br/><br/>We noticed that you recently got started with a task & uploaded an answer. We’ve assigned a mentor to review your answer and guide you through this challenge. Please login to codediy.com to check the progress on your task.<br/><br/>Task Name: " + taskName + "<br/><br/>Please feel free to write to " + adminEmail + " if you have any questions or need any assistance.<br/><br/>Regards,<br/>CodeDIY Team"
      };

      sgSendMail.sendgridMail(messages, function (err, response) {
        if (err){
          callback()
        } else {
          callback()
        }
      });
    },
    function (callback) { //mentor email
      userRepo.findUserWithId(mentorUserId)
          .then((userFound) => {
            if (userFound) {
              // console.log(mentorUserId, "---------------->>>", userFound);
              // let mentorAssignedMenteesTask = {
              //   // Email params
              //   to: userFound.email,
              //   name: userFound.firstName.capitalize(),
              //   subject: 'You’ve been assigned to review a task on CodeDIY',
              //   html: "Dear " + userFound.firstName.capitalize() + ",<br/><br/>We’ve assigned you to review a coding challenge taken by a mentee on CodeDIY. Please login to codediy.com to check the progress on your task and offer necessary guidance to the mentee. You can rate the mentee, post the completion of the task. <br/><br/>Task Name: " + taskName + "<br/><br/>Please feel free to write to " + adminEmail + " if you have any questions or need any assistance.<br/><br/>Regards,<br/>CodeDIY Team"
              // }
              // emailService.sendMail(mentorAssignedMenteesTask, function (err, response) {
              //   if (err) {
              //     console.log("email not sent", err)
              //     callback()
              //   }
              //   if (response.code == 'success') {
              //     callback()
              //   } else {
              //     console.log("email not sent")
              //     callback()
              //   }
              // })

            //  send grid api
              const messages = {
                to: userFound.email,
                from: "vinit.webmigrates@gmail.com",
                subject: "Congrats! You have a new mentee for your task",
                text: "Congrats. You have a new mentee for your task",
                html: `Pls visit <a href='https://beta.codediy.io/mentor-task-details/${taskEngagementId}' target="_blank">https://beta.codediy.io/${taskEngagementId}</a> to engage with your new Mentee for this task ${taskName}!`
                // html: "Dear " + userFound.firstName.capitalize() + ",<br/><br/>We’ve assigned you to review a coding challenge taken by a mentee on CodeDIY. Please login to codediy.com to check the progress on your task and offer necessary guidance to the mentee. You can rate the mentee, post the completion of the task. <br/><br/>Task Name: " + taskName + "<br/><br/>Please feel free to write to " + adminEmail + " if you have any questions or need any assistance.<br/><br/>Regards,<br/>CodeDIY Team"
              };

              sgSendMail.sendgridMail(messages, function (err, response1) {
                console.log("email1-1------>>>", response1)
                if (err){
                  callback()
                } else {
                  callback()
                }
              });
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
            }
          })
          .catch(err => {
            //console.log(err)
            callback(err)
          })
    },
    function (callback) {
      TaskEngagementRepo.findTaskEngagementWithId(taskEngagementId)
          .then((result) => {
            if (isAnonymous) {
              delete result.user;
              callback(null, result)
            } else {
              callback(null, result)
            }

          })
          .catch(err => {
            //console.log(err)
            callback(err)
          })
    }
  ], function (err, result) {
    if (err) {
      return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
    } else {
      return res.json({ status_code: 200, success: true, result: result, message: 'success.' })
    }
  })
}

exports.getActiveTask = function (req, res, next) {
  req.assert('userId', 'userId field can not be empty.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }

  // Request Data
  const userId = req.params.userId;
  console.log(userId, "userid")
  async.waterfall([
    function (callback) {
      userRepo.findUserWithId(userId)
          .then((userFound) => {
            if (userFound) {
              callback()
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
            }
          })
          .catch(err => {
            callback(err)
          })
    },
    function (callback) {
      userRepo.getActiveTask(userId)
          .then((task) => {
            if ((task.activeTasks).length > 0) {
              callback(null, task)
            } else {
              return res.json({ status_code: 204, success: false, message: 'No active task found.' })
            }
          })
          .catch((err) => {
            console.log(err)
            return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
          })
    }
  ], function (err, result) {
    if (err) {
      return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
    } else {
      return res.json({ status_code: 200, success: true, result: result, message: 'Active task found.' })
    }
  })

}


//===================== Old version (default mentor) ====================================//
// exports.checkMentorsAvailability = function (req, res, next) {
// 	// Generic validation
// 	req.assert('userId', 'userId field can not be empty.').notEmpty();
// 	req.assert('preferredLanguage', 'preferredLanguage field can not be empty.').notEmpty();
// 	req.assert('taskId', 'taskId field can not be empty.').notEmpty();

// 	const errors = req.validationErrors();

// 	if (errors) {
// 		return res.send({ status_code: 400, status: 'failure', message: errors })
// 	}

// 	// Request Data
// 	const userId = req.body.userId;
// 	const preferredLanguage = req.body.preferredLanguage || "english";
// 	const taskId = req.body.taskId

// 	let selectedMentorId = null;
// 	let mentorUserId = null;

// 	let isLanguageSupportedMentor = false;
// 	async.waterfall([
// 		function (callback) {
// 			userRepo.findUserWithId(userId)
// 				.then((userFound) => {
// 					if (userFound) {
// 						if (userFound.activeTaskCount == 0) {
// 							callback()
// 						} else {
// 							return res.json({
// 								status_code: 403,
// 								success: false,
// 								message: 'Oops, Please complete the current task to proceed with the new task.'
// 							})
// 						}
// 					} else {
// 						return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
// 					}
// 				})
// 				.catch(err => {
// 					callback(err)
// 				})
// 		},
// 		function (callback) {
// 			findMentor(userId, preferredLanguage,taskId)
// 				.then((assignedMentor) => {
// 					if (assignedMentor.isLanguageSupportedMentor != undefined && assignedMentor.isLanguageSupportedMentor != null) {
// 						if (assignedMentor.isLanguageSupportedMentor) {
// 							isLanguageSupportedMentor = true;
// 						}
// 					}
// 					selectedMentorId = assignedMentor._id || null;
// 					mentorUserId = assignedMentor.user._id || null;
// 					//console.log("final mentor: ", assignedMentor)
// 					typeof assignedMentor == undefined || typeof assignedMentor == null
// 						? res.json({ status_code: 403, success: false, message: noMentorsFoundErrorMsg })
// 						: assignedMentor.user == userId
// 							? res.json({ status_code: 403, success: false, message: noMentorsFoundErrorMsg })
// 							: callback(null, assignedMentor)
// 				})
// 				.catch(err => {
// 					console.log(err)
// 					return res.json({ status_code: 403, success: false, message: noMentorsFoundErrorMsg })
// 				})
// 		},
// 	], function (err, result) {
// 		if (err) {
// 			return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
// 		} else {
// 			return res.json({ status_code: 200, success: true, result: result, isLanguageSupportedMentor: isLanguageSupportedMentor,selectedMentorId:selectedMentorId,mentorUserId:mentorUserId, message: 'Mentor Found.' })
// 		}
// 	})
// }

//====================================ENDS======================================================//

exports.logout = function (req, res, next) {
  req.assert('userId', 'userId field can not be empty.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }

  // Request Data
  const userId = req.params.userId;
  let data = {
    isLoggedIn: false,
    lastLoggedOut: Date.now()
  }
  async.waterfall([
    function (callback) {
      userRepo.findUserWithId(userId)
          .then((userFound) => {
            if (userFound) {
              callback()
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
            }
          })
          .catch(err => {
            callback(err)
          })
    },
    function (callback) {
      userRepo.update(userId, data)
          .then(() => {
            callback();
          })
          .catch((err) => {
            console.log(err)
            return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
          })
    }
  ], function (err, result) {
    if (err) {
      return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
    } else {
      return res.json({ status_code: 200, success: true, message: 'Logged Out.' })
    }
  })

}


//===================Mentee profile edit/update=======================//

exports.editProfile = async (req, res) => {
  console.log("editProfile--->", req.body);
  req.assert('type', 'type field can not be empty.').notEmpty();
  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }

  else {
    try {
      let input = req.body;
      let updateObj = {}

      //To update personal data
      if (input.type == "personal")
        updateObj['$set'] = input.personalData

      // To delete the object from github, leetcode ....array
      else if (input.operation == "delete")
        updateObj['$pull'] = { [input.type]: { _id: input.arrayObjId } }

      // To add the object to github,leetcode.....array
      else
        updateObj['$push'] = { [input.type]: input[input.type] }

      let updateProfile = await userRepo.editProfile(input.userId, updateObj)

      if (updateProfile)
        res.status(200).json({ status_code: 200, status: 'success', Updatedprofile: updateProfile })
      else
        res.status(400).json({ status_code: 400, status: 'failure', message: "Error updating the profile" })
    }

    catch (err) {
      res.status(500).json({ status_code: 500, status: 'Failure', message: err })
    }
  }

};


exports.getProfileDetails = async (req, res) => {
  req.assert('userId', 'userId field can not be empty.').notEmpty();
  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }

  else {
    try {

      let profileDetails = await userRepo.getProfileDetails(req.params.userId);
      if (profileDetails)
        res.status(200).json({ status_code: 200, status: 'success', profileDetails: profileDetails });
      else
        res.status(400).json({ status_code: 400, status: 'failure', message: "Error fetching the profile details" })
    }
    catch (err) {
      res.status(500).json({ status_code: 500, status: 'Failure', message: err })
    }
  }

}


//======================Credits purchase=============================//

exports.purchaseCredits = async (req, res) => {
  req.assert('userId', 'userId field can not be empty.').notEmpty();
  req.assert('paymentStatus', 'paymentStatus field can not be empty.').notEmpty();
  req.assert('razorpayId', 'razorpayId field can not be empty.').notEmpty();
  req.assert('captured', 'captured field can not be empty.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }
  else {
    try {
      let record = '';
      let input = req.body
      if ((input.paymentStatus).toLowerCase() == 'success') {
        const messages = {
          to: req.body.email,
          from: "vinit.webmigrates@gmail.com",
          subject: "CodeDiy Purchase Credits",
          text: "CodeDiy Purchase Credits",
          html: `<h3>Hello, Your payment has been successful and purchase credits with ${input.credits || "0"}</h3>`
        };
        let creditPaymentData = {
          user: input.userId,
          credits: input.credits,
          amountPaid: input.amountPaid,
          paymentStatus: input.paymentStatus,
          paymentMode: input.paymentMode,
          paymentGateway: input.paymentGateway,
          razorPay: {
            razorpayId: input.razorpayId,
            captured: input.captured,
          },
          email: req.body.email
        };
        let savecreditpayment = await paymentRepo.saveCreditPayment(creditPaymentData);
        if (savecreditpayment) {
          await paymentRepo.updateCredits(input.credits, input.userId);
          await sgSendMail.sendgridMail(messages, function (err, response) {
            if (err){
              console.log("mail error----->>>", err);
            } else {
              record = response
            }
          });
          res.status(200).json({ status_code: 200, status: 'success', message: "credits purchased successfully", mail: record })
        }
        else
          res.status(400).json({ status_code: 400, status: 'failure', message: "Error purchasing credits" })

      } else {
        return res.json({ status_code: 500, success: false, message: "Payment failure.. " })
      }


    }
    catch (err) {
      res.status(500).json({ status_code: 500, status: 'Failure', message: err })
    }
  }
}

exports.adminGrantCredits = async (req, res) =>{
  try{
    const result = await paymentRepo.saveCreditPayment(req.body);
    const findUser = await userRepo.findUserWithId(req.body.user);
    if (result && findUser) {
      const data = {credits: Number(findUser.credits)+Number(req.body.credits)};
      await userRepo.update(req.body.user, data);
      return res.send({ status_code: 200, status: 'success', result })
    } else {
      return res.send({ status_code: 400, status: 'failure' })
    }
  } catch (e) {
    return res.send({ status_code: 404, status: 'failure', message: e })
  }
};

exports.imageUpload = async (req, res) => {
  //console.log(req.files,"Files Image upload")
  if (req.files.file == undefined || req.files.file == null) {
    req.assert('file', 'file field can not be empty.').notEmpty();
  }
  req.assert('path', 'path cannot be empty')
  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }
  else {
    try {
      let result = await aws.uploadToS3(req.body.path, req.files.file);
      //console.log(result,"Result")

      if (result)
        res.status(200).json({ status_code: 200, status: 'success', result: result })
      else
        res.status(400).json({ status_code: 400, status: 'failure', message: "Error updating the profile" })
    }
    catch (err) {
      res.status(500).json({ status_code: 500, status: 'Failure', message: err })
    }
  }

}


//==============================New Version ==================================//


exports.checkMentorsAvailability = function (req, res, next) {
  console.log("check --------->");
  // Generic validation
  req.assert('userId', 'userId field can not be empty.').notEmpty();
  req.assert('preferredLanguage', 'preferredLanguage field can not be empty.').notEmpty();
  req.assert('taskId', 'taskId field can not be empty.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }

  // Request Data
  const userId = req.body.userId;
  const preferredLanguage = req.body.preferredLanguage || "english";
  const taskId = req.body.taskId;


  let mentorsWithMinActiveTasks;
  let selectedMentorId = null;
  let mentorUserId = null;

  async.waterfall([
    function (callback) {
      userRepo.findUserWithId(userId)
          .then((userFound) => {
            if (userFound) {
              if (userFound.activeTaskCount === 0) {
                callback()
              } else {
                return res.json({
                  status_code: 403,
                  success: false,
                  message: 'Oops, Please complete the current task to proceed with the new task.'
                })
              }
            } else {
              return res.json({ status_code: 404, success: false, message: 'Invalid user id.' })
            }
          })
          .catch(err => {
            callback(err)
          })
    },
    function (callback) {
      mentorRepo.getApprovedTasksMentor(taskId)
          .then((approvedTasksMentor) => {

            if (approvedTasksMentor) {
              if (approvedTasksMentor.length > 0) {
                let assignedMentor = findAvailableMentors(userId,approvedTasksMentor)
                //console.log(assignedMentor,"ASSIGNED")
                assignedMentor.length === 0
                    ? res.json({ status_code: 405, success: false, message: "All the mentors for this task are occupied" })
                    : preferredLanguage !== "english"?
                    findSupportedLanguageMentors(assignedMentor,preferredLanguage)
                        .then((supportedLanguageMentors) => {
                          if(supportedLanguageMentors.length>0)
                          {
                            if(supportedLanguageMentors.length>1)
                            {
                              let mentorWithMinTasks = findMentorsWithMinimumActiveTask(supportedLanguageMentors);
                              selectedMentorId = mentorWithMinTasks._id || null;
                              mentorUserId = mentorWithMinTasks.user._id || null;
                              callback(null,mentorWithMinTasks)
                            }
                            else
                            {
                              selectedMentorId = supportedLanguageMentors[0]._id || null;
                              mentorUserId = supportedLanguageMentors[0].user._id || null;
                              callback(null,supportedLanguageMentors[0])
                            }
                          }
                          else
                            return res.json({
                              status_code: 406,
                              success: false,
                              message: 'No mentors available for this language'
                            })
                        })


                    : assignedMentor.length>1?
                        (mentorsWithMinActiveTasks=  findMentorsWithMinimumActiveTask(assignedMentor),
                                selectedMentorId = mentorsWithMinActiveTasks._id || null,
                                mentorUserId = mentorsWithMinActiveTasks.user._id || null,
                                callback(null,mentorsWithMinActiveTasks)
                        )
                        :(selectedMentorId = assignedMentor[0]._id || null, mentorUserId = assignedMentor[0].user._id || null,callback(null,assignedMentor[0]))
              }
              else {
                return res.json({
                  status_code: 403,
                  success: false,
                  message: 'No mentors available for this task'
                })
              }
            }
            else {
              return res.json({ status_code: 404, success: false, message: 'Invalid task id.' })
            }
          })
          .catch(err => {
            console.log(err)
            return res.json({ status_code: 403, success: false, message: noMentorsFoundErrorMsg })
          })
    },
  ], function (err, result) {
    if (err) {
      return res.json({ status_code: 500, success: false, message: internalServerError, Error: err })
    } else {
      return res.json({ status_code: 200, success: true, result: result, selectedMentorId: selectedMentorId, mentorUserId: mentorUserId, message: 'Mentor Found.' })
    }
  })
};






//==============================Ends ==============================================//


exports.findUserName = async (req, res) => {
  console.log("------pro-----", req.body.userId, req.body.userName);
  //console.log(req.files,"Files Image upload")
  req.assert('userId', 'userId field can not be empty.').notEmpty();
  req.assert('userName', 'userName cannot be empty').notEmpty();
  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }
  else {
    try {
      let result = await userRepo.findIfUserNameExists(req.body.userId, req.body.userName)

      if (result.length>0)
        res.status(201).json({ status_code: 201, status: 'success', message: "username exists" })
      else if(result.length==0)
        res.status(200).json({ status_code: 200, status: 'success', message: "username not exists" })
      else
        res.status(400).json({ status_code: 400, status: 'failure', message: "Error finding the username" })
    }
    catch (err) {
      res.status(500).json({ status_code: 500, status: 'Failure', message: err })
    }
  }

}

exports.findUserIdByName =  async (req, res) => {
  req.assert('userName', 'userName cannot be empty').notEmpty();
  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }
  else {
    try {
      let result = await userRepo.findUserIdByName(req.body.userName)

      if (result.length>0)
        res.status(200).json({ status_code: 200, status: 'success', message: "user found",userId:result[0]._id })
      else if(result.length==0)
        res.status(201).json({ status_code: 201, status: 'success', message: "user does not exists" })
      else
        res.status(400).json({ status_code: 400, status: 'failure', message: "Error finding the username" })
    }
    catch (err) {
      res.status(500).json({ status_code: 500, status: 'Failure', message: err })
    }
  }

}


exports.getCredits =  async (req, res) => {
  req.assert('userId', 'userId cannot be empty').notEmpty();
  const errors = req.validationErrors();

  if (errors) {
    return res.send({ status_code: 400, status: 'failure', message: errors })
  }
  else {
    try {
      let credits = await userRepo.fetchCredits(req.body.userId)

      if (credits)
        res.status(200).json({ status_code: 200, status: 'success', credits:credits.credits})
      else
        res.status(400).json({ status_code: 400, status: 'failure', message: "Error fetching the credits" })
    }
    catch (err) {
      res.status(500).json({ status_code: 500, status: 'Failure', message: err })
    }
  }

};

exports.getUserToken=async(req,res)=>{
    const getFindUser=await User.findOne({email:req.body.useremail,password:req.body.password})
    if(getFindUser){
        res.status(200).json({token:getFindUser.socialLoginInfo.authToken})
    }else {
        res.status(400).json({ status_code: 400, status: 'failure', message: "email & password is not valid" })
    }
}




