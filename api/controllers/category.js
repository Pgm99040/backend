 'use strict';
// load the things we need
const asyncawait = require('asyncawait/async');
const await = require('asyncawait/await');
const mongoose = require('mongoose');
const moment = require('moment');
const async = require('async');
const jwt = require('jwt-simple');
// Required services ====================================
const objectHelper = require('../../helpers/objectHelper');
const config = require('../../config')
const jwtTokenSecret = config.masterToken;
const errorsUtil = require('../../utils/errors')
// Required repos ======================================
const categoryRepo = require('../repository/category');
 const subcategoryRepo = require('../repository/subcategory');

// Errors
const internalServerError = 'Internal server Error';
/**
 * POST /addCategory
 */
exports.addCategory = function(req, res, next) {
	// Generic validation
	req.assert('name', 'name name field can not be empty.').notEmpty();
	req.assert('description', 'description name field can not be empty.').notEmpty();

	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
	const name = req.body.name;
	const description = req.body.description;
	const data = {
	  isActive: true,
		name : name,
		description: description
	}
	categoryRepo.save(data)
		.then((result) => {
			return res.json({status_code:201, success: true, result:result, message:'New category added.'})
		})
		.catch((err) => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
}
/**
 * POST /updateCategory
 */
exports.updateCategory = function(req, res, next) {
	// Generic validation
	req.assert('_id', '_id name field can not be empty.').notEmpty();
	req.assert('name', 'name name field can not be empty.').notEmpty();
	req.assert('description', 'description name field can not be empty.').notEmpty();

	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
	const id = req.body._id;
	const name = req.body.name;
	const description = req.body.description;

	const data = {
		name : name,
		description: description
	}
	categoryRepo.update(id, data)
		.then((result) => {
			if(result) {
				return res.json({status_code:200, success: true, result:result, message:'Category updated.'})
			} else {
				return res.json({status_code:404, success: false, message:'Invalid id.'})
			}
		})
		.catch((err) => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
}
/**
 * GET /viewCategory/:id
 */
exports.viewCategory = function(req, res, next) {
	// Generic validation
	req.assert('id', 'id name field can not be empty.').notEmpty();
	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}
	// Request Data
	const id = req.params.id;
	categoryRepo.findCategoryWithId(id)
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
}
/**
 * GET /listCategory
 */
exports.listCategory = function(req, res, next) {
	categoryRepo.listCategory()
		.then((result) => {
			if(result) {
				return res.json({status_code:200, success: true, result:result})
			} else {
				return res.json({status_code:404, success: false, message:'No category found.'})
			}
		})
		.catch((err) => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
}

exports.AllListCategory = function(req, res, next) {
	categoryRepo.listCategoryAll()
		.then((result) => {
			if(result) {
				return res.json({status_code:200, success: true, result:result})
			} else {
				return res.json({status_code:404, success: false, message:'No category found.'})
			}
		})
		.catch((err) => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
 };

/**
 * POST /findCategoryWithIds
 */
exports.findCategoryWithIds = function(req, res, next) {
	// Generic validation
	req.assert('arrayOfIds', 'arrayOfIds name field can not be empty.').notEmpty();
	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
	const arrayOfIds = req.body.arrayOfIds;

	categoryRepo.findCategoryWithIds(arrayOfIds)
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

exports.categoryIdSubcategory = function(req, res) {
	const id = req.params.id;
	subcategoryRepo.findWithId(id)
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

exports.categoryIdSubcategoryAdmin = function(req, res) {
	const id = req.params.id;
	subcategoryRepo.findWithId(id)
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

 exports.activeCategory = async (req, res) => {
	 const id = req.params.id;
	 await categoryRepo.active(id).then(response=>{
		 if (response) {
			 res.status(200).send({msg: "SuccessFully Activate Task."});
		 } else {
			 res.status(400).send({msg: "something went wrong."});
		 }
	 }).catch(err =>{
		 res.status(500).send({msg: "internal server error."});
		 console.log("err---->", err);
	 })
 }

 exports.deActiveCategory = async (req, res) => {
	 const id = req.params.id;
	 await categoryRepo.deActive(id).then(response=>{
		 if (response) {
			 res.status(200).send({msg: "SuccessFully DeActivate Task."});
		 } else {
			 res.status(400).send({msg: "something went wrong."});
		 }
	 }).catch(err =>{
		 res.status(500).send({msg: "internal server error."});
		 console.log("err---->", err);
	 })
 }
