
 'use strict';
// load the things we need
const asyncawait = require('asyncawait/async');
const await = require('asyncawait/await');
const mongoose = require('mongoose');
const moment = require('moment');
const async = require('async');
const jwt = require('jwt-simple');
 const Sentry = require("@sentry/node");
// Required services ====================================
const objectHelper = require('../../helpers/objectHelper');
const config = require('../../config');
const jwtTokenSecret = config.masterToken;
const errorsUtil = require('../../utils/errors');
// Required repos ======================================
const categoryRepo = require('../repository/category');
const subcategoryRepo = require('../repository/subcategory');
const predefinedTaskRepo = require('../repository/predefinedtask');
 const TaskEngagementRepo = require('../repository/taskengagement');
 const mentorRepo = require('../repository/mentor');
 const Mentor = mongoose.model('Mentor');
// Errors
const internalServerError = 'Internal server Error';
/**
 * POST /addPredefinedTask
 */
exports.addPredefinedTask = function(req, res, next) {
	// Generic validation
	req.assert('subcategory', 'subcategoryId field can not be empty.').notEmpty();
	req.assert('name', 'name field can not be empty.').notEmpty();
	req.assert('description', 'description field can not be empty.').notEmpty();
	req.assert('tinyDescription', 'tinyDescription field can not be empty.').notEmpty();
	// req.assert('resources', 'resources field can not be empty.').notEmpty();
	req.assert('difficultyLevel', 'difficultyLevel field can not be empty.').notEmpty();
	req.assert('taskType', 'taskType field can not be empty.').notEmpty();
	req.assert('price', 'price field can not be empty.').notEmpty();
	// req.assert('relatedKnowledgeBlock', 'relatedKnowledgeBlock field can not be empty.').notEmpty();
	req.assert('relatedCareerPath', 'relatedCareerPath field can not be empty.').notEmpty();
	// req.assert('taskMentor', 'taskMentor field can not be empty.').notEmpty();
	//req.assert('currencyCode', 'currencyCode field can not be empty.').notEmpty();
	req.assert('imageUrl', 'imageUrl field can not be empty.').notEmpty();
	req.assert('credits', 'credits field can not be empty.').notEmpty();



	const errors = req.validationErrors();
	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}
	// Request Data
	const subcategoryId = req.body.subcategory;
	const name = req.body.name;
	const description = req.body.description;
	const difficultyLevel = req.body.difficultyLevel;
	const taskType = req.body.taskType;
	const price = req.body.price;
	const relatedKnowledgeBlock = req.body.relatedKnowledgeBlock;
	const relatedCareerPath = req.body.relatedCareerPath;
	// const taskMentor = req.body.taskMentor;
	const tinyDescription = req.body.tinyDescription;
	const resources = req.body.resources;
	const currencyCode = req.body.currencyCode;
	const imageUrl = req.body.imageUrl;
	const credits = req.body.credits;
	const taskDetailedDescriptionForMentee = req.body.taskDetailedDescriptionForMentee
	const mediaLink = req.body.mediaLink


	const data = {
		isActive: true,
		category:null,
		name : name,
		description: description,
		tinyDescription: tinyDescription,
		resources: resources,
		currencyCode:currencyCode,
		difficultyLevel: difficultyLevel,
		taskType: taskType,
		price: price,
		relatedKnowledgeBlock: relatedKnowledgeBlock,
		relatedCareerPath: relatedCareerPath,
		// taskMentor: taskMentor,
		subcategory: subcategoryId,
		imageUrl:imageUrl,
		credits:credits,
		taskDetailedDescriptionForMentee: taskDetailedDescriptionForMentee,
		mediaLink:mediaLink
	};
	subcategoryRepo.findSubcategoryWithId(subcategoryId)
		.then((subcategoryFound) => {
			console.log("subcategoryFound-->",subcategoryFound)
			if(subcategoryFound) {
				data.category=subcategoryFound.category._id;
				predefinedTaskRepo.save(data)
					.then((newPredefinedTask) => {
						subcategoryRepo.predefinedTaskMapping(subcategoryId, newPredefinedTask._id)
							.then((mapPredefinedTaskToSubcategory) => {
								return res.json({status_code:201, success: true, result: newPredefinedTask, message: 'Predefined Task added.'})
							})
							.catch(err => {
								return res.json({status_code:500, success: false, message: internalServerError, error: err})
							})
					})
					.catch(err => {
						return res.json({status_code:500, success: false, message: internalServerError, error: err})
					})
			}else {
				return res.json({status_code:404, success: false, message:'Subcategory not found.'})
			}
		})
		.catch(err => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
};

/**
 * POST PredefinedTask/bulkInsert
 */
exports.bulkInsert = function(req, res, next) {
	let predefinedTaskIds = [];
	async.waterfall([
		function(callback) {
			subcategoryRepo.findSubcategoryWithIdWithoutPopulate(req.body.subcategoryId)
				.then((subcategoryFound) => {
					predefinedTaskIds = subcategoryFound.predefinedTasks;
					callback()
				})
				.catch((err) => {
					console.log(err)
					callback(err)
				})
		},
		function(callback) {
			predefinedTaskRepo.bulkInsert(req.body.docs)
				.then((predefinedTasks) => {
					predefinedTasks.map((predefinedTask) => {
						predefinedTaskIds.push(predefinedTask._id || "")
					})
					callback()
				})
				.catch((err) => {
					console.log(err)
					callback(err)
				})
		},
		function(callback) {
			subcategoryRepo.update(req.body.subcategoryId, {predefinedTasks: predefinedTaskIds})
				.then((mapPredefinedTaskToSubcategory) => {
					callback()
				})
				.catch(err => {
					callback(err)
				})
		}
	], function(err, result) {
		if(err) {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		}else {
			return res.json({status_code:200, success: true, message:"Successfully added."})
		}
	})
};
/**
 * POST /updatePredefinedTask
 */
exports.updatePredefinedTask = async function(req, res, next) {
	console.log("req.body", req.body)
	// Generic validation
	req.assert('predefinedTaskId', 'predefinedTaskId name field can not be empty.').notEmpty();
	req.assert('name', 'name name field can not be empty.').notEmpty();
	req.assert('description', 'description name field can not be empty.').notEmpty();
	req.assert('difficultyLevel', 'difficultyLevel name field can not be empty.').notEmpty();
	req.assert('taskType', 'taskType name field can not be empty.').notEmpty();
	req.assert('price', 'price name field can not be empty.').notEmpty();
	// req.assert('relatedKnowledgeBlock', 'relatedKnowledgeBlock name field can not be empty.').notEmpty();
	req.assert('relatedCareerPath', 'relatedCareerPath name field can not be empty.').notEmpty();
	// req.assert('taskMentor', 'taskMentor name field can not be empty.').notEmpty();
	req.assert('credits', 'credits field can not be empty.').notEmpty();
	req.assert('imageUrl', 'imageUrl field can not be empty.').notEmpty();
	const errors = req.validationErrors();
	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}
	// Request Data
	const predefinedTaskId = req.body.predefinedTaskId;
	const subcategoryId = req.body.subcategory;
	const name = req.body.name;
	const description = req.body.description;
	const difficultyLevel = req.body.difficultyLevel;
	const taskType = req.body.taskType;
	const price = req.body.price;
	const relatedKnowledgeBlock = req.body.relatedKnowledgeBlock;
	const relatedCareerPath = req.body.relatedCareerPath;
	// const taskMentor = req.body.taskMentor;
	const credits = req.body.credits;
	const  tinyDescription = req.body. tinyDescription;
	const imageUrl = req.body.imageUrl;
	const taskDetailedDescriptionForMentee = req.body.taskDetailedDescriptionForMentee;
	const mediaLink = req.body.mediaLink;
	const data = {
		name : name,
		description: description,
		difficultyLevel: difficultyLevel,
		taskType: taskType,
		price: price,
		relatedKnowledgeBlock: relatedKnowledgeBlock,
		relatedCareerPath: relatedCareerPath,
		// taskMentor: taskMentor,
		credits:credits,
		subcategory: subcategoryId,
		tinyDescription:  tinyDescription,
		imageUrl:imageUrl,
		taskDetailedDescriptionForMentee: taskDetailedDescriptionForMentee,
		mediaLink:mediaLink
	};

	predefinedTaskRepo.update(predefinedTaskId, data)
		.then((result) => {
			if(result) {
				return res.json({status_code:200, success: true, result:result, message:'PredefinedTask updated.'})
			} else {
				return res.json({status_code:404, success: false, message:'Invalid id.'})
			}
		})
		.catch((err) => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
};
/**
 * GET /viewPredefinedTask/:id
 */
exports.viewPredefinedTask = function(req, res, next) {
	const data = req.user;
	console.log(`${data && data.email} is Viewing the Task ${req.params.id}. ${new Date()}:`);
    Sentry.addBreadcrumb({
        category: "auth",
        message: `${data && data.email} is Viewing the Task ${req.params.id}. ${new Date()}:`,
        level: Sentry.Severity.Info,
    });
	console.log(req.params.id);
	// Generic validation
	req.assert('id', 'id name field can not be empty.').notEmpty();
	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}
	// Request Data
	const id = req.params.id;
	predefinedTaskRepo.findPredefinedTaskWithId(id)
		.then((result) => {
			if(result) {
				return res.json({status_code:200, success: true, result: result})
			} else {
				return res.json({status_code:404, success: false, message:'Invalid id.'})
			}
		})
		.catch((err) => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
};

 exports.viewPredefinedTaskDetail = function(req, res, next) {
     console.log(req.params.id);
     // Generic validation
     req.assert('id', 'id name field can not be empty.').notEmpty();
     const errors = req.validationErrors();

     if (errors) {
         return res.send({status_code:400, status:'failure', message:errors})
     }
     // Request Data
     const id = req.params.id;
     predefinedTaskRepo.findPredefinedDetailTaskWithId(id)
         .then((result) => {
             if(result) {
                 return res.json({status_code:200, success: true, result: result})
             } else {
                 return res.json({status_code:404, success: false, message:'Invalid id.'})
             }
         })
         .catch((err) => {
             return res.json({status_code:500, success: false, message: internalServerError, error: err})
         })
 };

/**
 * GET /listPredefinedTask
 */
exports.listPredefinedTask = function(req, res, next) {
	predefinedTaskRepo.listPredefinedTask()
		.then((result) => {
			if(result) {
				return res.json({status_code:200, success: true, result:result})
			} else {
				return res.json({status_code:404, success: false, message:'Invalid id.'})
			}
		})
		.catch((err) => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
};

exports.listPredefinedTaskWithOptions = function(req, res, next) {
	// Generic validation
	req.assert('categoryIds', 'categoryIds field can not be empty.').notEmpty();

	const errors = req.validationErrors();
	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	let category = req.body.categoryIds;
	let subcategory = req.body.subcategoryIds;

	let options = {
		difficultyLevel: req.body.difficultyLevel,
		maxPrice: req.body.maxPrice,
		minPrice: req.body.minPrice
	};
	predefinedTaskRepo.listPredefinedTaskWithOptions(category, subcategory, options)
		.then((result) => {
			if(result) {
				return res.json({status_code:200, success: true, result:result})
			} else {
				return res.json({status_code:404, success: false, message:'Invalid id.'})
			}
		})
		.catch((err) => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
};

//searchTaskByRegEx with options
exports.searchTask = function(req, res, next) {
	// Generic validation
	req.assert('searchText', 'searchText field can not be empty.').notEmpty();

	const errors = req.validationErrors();
	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	let searchText = req.body.searchText;
	let category = req.body.categoryIds || [];
	let subcategory = req.body.subcategoryIds || [];

	let options = {
		difficultyLevel: req.body.difficultyLevel || null,
		maxPrice: req.body.maxPrice,
		minPrice: req.body.minPrice
	};
	predefinedTaskRepo.searchTaskByRegEx(category, subcategory, options, searchText)
	.then((result) => {
		if(result) {
			return res.json({status_code:200, success: true, result:result})
		}
		return res.json({status_code:204, success: false, message: "No results found!"})
	})
	.catch((err) => {
		return res.json({status_code:500, success: false, message: internalServerError, error: err})
	})
	// predefinedTaskRepo.searchTaskByRegEx(category, subcategory, options, searchText)
	// 	.then((result) => {
	// 		if(result) {
	// 			return res.json({status_code:200, success: true, result:result})
	// 		}
	// 		return res.json({status_code:204, success: false, message: "No results found!"})
	// 	})
	// 	.catch((err) => {
	// 		return res.json({status_code:500, success: false, message: internalServerError, error: err})
	// 	})
};
// exports.searchTask = function(req, res, next) {
// 	// Generic validation
// 	req.assert('searchText', 'searchText field can not be empty.').notEmpty();

// 	const errors = req.validationErrors();
// 	if (errors) {
// 		return res.send({status_code:400, status:'failure', message:errors})
// 	}

// 	let searchText = req.body.searchText;

// 	predefinedTaskRepo.searchTaskByRegEx(searchText)
// 		.then((result) => {
// 			if(result) {
// 				return res.json({status_code:200, success: true, result:result})
// 			}
// 			return res.json({status_code:204, success: false, message: "No results found!", result:result})
// 		})
// 		.catch((err) => {
// 			return res.json({status_code:500, success: false, message: internalServerError, error: err})
// 		})
// }


exports.sortByOptions = function(req, res, next) {
	// Generic validation
	req.assert('sortType', 'sortType field can not be empty.').notEmpty();
	if(req.body.sortType=="sortByDate") {
		req.assert('newToOld', 'newToOld field can not be empty.').notEmpty();
		req.assert('newToOld', 'newToOld field must be a boolean value.').isBoolean();

	}
	if(req.body.sortType=="sortByPrice") {
		req.assert('highToLow', 'highToLow field can not be empty.').notEmpty();
		req.assert('highToLow', 'highToLow must be a boolean value.').isBoolean();

	}
	const errors = req.validationErrors();
	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	let sortType = req.body.sortType;
	let options = {};
	if(sortType == "sortByDate") {
		let newToOld = req.body.newToOld;
		options = {
			sortType: sortType,
			newToOld: newToOld
		}
	}
	if(sortType == "sortByPrice") {
		let highToLow = req.body.highToLow;
		options = {
			sortType: sortType,
			highToLow: highToLow
		}
	}
	predefinedTaskRepo.sortByOptions(options)
		.then((result) => {
			if(result) {
				return res.json({status_code:200, success: true, result:result})
			}
			return res.json({status_code:204, success: false, message: "No results found!", result:result})
		})
		.catch((err) => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
};

exports.recordPredefinedTask = function(req, res){
	const id = req.params.id;
	mentorRepo.findMentorId(id).then(response =>{
		if (response === null) {
			return res.json({status_code:204, success: false, message: "No results found!", result:response});
		} else {
			predefinedTaskRepo.findPredefinedTaskWithIds(response.approvedTasksForMentorship).then(response =>{
				if (response) {
					res.status(200).send(response);
				} else {
					res.status(400);
				}
			});
		}
	}).catch(err =>{
		console.log("error-->", err);
	})
};

 exports.addPredefinedTaskInMentor = async function (req, res){
	 const id = req.params.id;
	 let isApproved = false;
	 if (req.body.length > 0){
		  isApproved = true
	 } else {
		 isApproved = false
	 }
	 const data1 = { $addToSet: { approvedTasksForMentorship: req.body  }, isApproved: isApproved };
	 await mentorRepo.findByIdAndUpdate(id, data1).then(response =>{
	 	if (response) {
	 		res.status(200).send(response);
		}
	 }).catch(err =>{
	 	res.status(400);
	 	console.log("error-->", err);
	 })

 };

 exports.deleteCategory =  async function (req, res){
	 const id = req.params.id;
	 const taskId = req.params.taskId;
	 let data1 = { $pull: { approvedTasksForMentorship:  { $in: taskId }} };
	 await mentorRepo.deleteRecord(id, data1).then(async response =>{
		 if (response) {
			 let findData = await Mentor.findOne({_id: id});
			 let data = {};
			 if(findData && findData.approvedTasksForMentorship && findData.approvedTasksForMentorship.length > 0){
				 data.isApproved = true;
			 } else {
				 data.isApproved = false;
			 }
			 await mentorRepo.deleteRecord(id, data).then(res1 =>{
			 	if (res1) {
					res.status(200).send(res1);
				}
			 })
		 }
	 }).catch(err =>{
		 res.status(400);
		 console.log("error-->", err);
	 })
 };

 exports.mentorAssignTaskTaskEngagement = async function(req, res){
 	const mentorId = req.params.id;
 	await mentorRepo.findMentorWithId(mentorId).then(async response=>{
 		if (response){
 			let data = await TaskEngagementRepo.findTaskEngagementWithTaskId(response.approvedTasksForMentorship);
 			if (data){
				res.status(200).send(data);
			} else {
				res.status(400).send({msg: "something went wrong."});
			}
 		}
	}).catch(err =>{
		res.status(500).send({msg: "internal server error."});
		console.log("err---->", err);
	})
 };

 exports.deletePredefinedTask = async function (req, res) {
	 const id = req.params.id;
	 await predefinedTaskRepo.delete(id).then(response=>{
	 	if (response) {
			res.status(200).send({msg: "SuccessFully DeActivate Task."});
		} else {
			res.status(400).send({msg: "something went wrong."});
		}
	 }).catch(err =>{
		 res.status(500).send({msg: "internal server error."});
		 console.log("err---->", err);
	 })
 };

 exports.activePredefinedTask = async function (req, res) {
 	console.log("active")
	 const id = req.params.id;
	 await predefinedTaskRepo.active(id).then(response=>{
	 	console.log("response",response)
		 if (response) {
			 res.status(200).send({msg: "SuccessFully Activate Task."});
		 } else {
			 res.status(400).send({msg: "something went wrong."});
		 }
	 }).catch(err =>{
		 res.status(500).send({msg: "internal server error."});
		 console.log("err---->", err);
	 })
 };

 exports.predefinedTaskControllerReview=(req, res)=>{
	 const id = req.params.id
	 const review= req.body
	 predefinedTaskRepo.updateReview(id, review)
		 .then((item) => {
			 if (item) {
				 res.status(200).send({msg: "SuccessFully add Taskreview."});
			 } else {
				 res.status(400).send({msg: "something went wrong."});
			 }
		 })
		 .catch(err => {
			 console.log("err",err)
		 })
 }

 exports.getwatchReview=(req, res)=>{
	 const id = req.params
	 predefinedTaskRepo.getReview(id)
		 .then((item) => {
			 if (item) {
				 res.status(200).send({msg: "SuccessFully get Taskreview.",review:item.review});
			 } else {
				 res.status(400).send({msg: "something went wrong."});
			 }
		 })
		 .catch(err => {
			 console.log("err",err)
		 })
 }


