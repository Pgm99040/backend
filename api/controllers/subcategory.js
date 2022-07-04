 'use strict';
// load the things we need
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const mongoose = require('mongoose');
const moment = require('moment');
const asyncUtil = require('async');
const jwt = require('jwt-simple');
// Required services ====================================
const objectHelper = require('../../helpers/objectHelper');
const config = require('../../config')
const jwtTokenSecret = config.masterToken;
const errorsUtil = require('../../utils/errors')
// Required repos =======================================
const subcategoryRepo = require('../repository/subcategory');
const categoryRepo = require('../repository/category');
// Errors
const internalServerError = 'Internal server Error';
/**
 * POST /addsubcategory
 */
exports.addSubCategory = async (function (req, res, next) {
	// Generic validation
	req.assert('categoryId', 'categoryId name field can not be empty.').notEmpty();
	req.assert('name', 'name name field can not be empty.').notEmpty();
	req.assert('description', 'description name field can not be empty.').notEmpty();

	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}
	// Request Data
	const categoryId = req.body.categoryId;
	const name = req.body.name;
	const description = req.body.description;
	const data = {
		isActive : true,
		name : name,
		description: description,
		category: categoryId
	}
	let categoryFound = await (categoryRepo.findCategoryWithId(categoryId));
	if(categoryFound) {
		let newSubcategory = await (subcategoryRepo.save(data));
		let mapSubcategoryToCategory = await (categoryRepo.subcategoryMapping(categoryId, newSubcategory._id));
		return res.json({status_code:201, success: true, result: newSubcategory, message: 'Subcategory added.'})
	}
	else {
		return res.json({status_code:404, success: false, message:'Category not found.'})
	}
})
/**
 * POST /updateSubcategory
 */
exports.updateSubcategory = async(function(req, res, next) {
	// Generic validation
	req.assert('subcategoryId', 'subcategoryId name field can not be empty.').notEmpty();
	req.assert('name', 'name name field can not be empty.').notEmpty();
	req.assert('description', 'description name field can not be empty.').notEmpty();

	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
	const id = req.body.subcategoryId;
	const name = req.body.name;
	const description = req.body.description;

	const data = {
		name : name,
		description: description
	}
	subcategoryRepo.update(id, data)
		.then((result) => {
			if(result) {
				return res.json({status_code:202, success: true, result:result, message:'Subcategory updated.'})
			} else {
				return res.json({status_code:404, success: false, message:'Invalid id.'})
			}

		})
		.catch((err) => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
})
/**
 * GET /listSubcategory
 */
exports.listSubcategory = async(function(req, res, next) {
	subcategoryRepo.listSubcategory()
		.then((result) => {
			if(result) {
				return res.json({status_code:200, success: true, result:result})
			} else {
				return res.json({status_code:404, success: false, message:'No subcategories found.'})
			}
		})
		.catch((err) => {
			return res.json({status_code:500, success: false, message: internalServerError, error: err})
		})
})

/**
 * GET /viewSubcategory/:id
 */
exports.viewSubcategory = async(function(req, res, next) {
	// Generic validation
	req.assert('id', 'id name field can not be empty.').notEmpty();
	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
	const id = req.params.id;
	subcategoryRepo.findSubcategoryWithId(id)
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
});

/**
 * POST /findCategoryWithIds
 */
exports.findSubcategoryWithIds = function(req, res, next) {
	// Generic validation
	req.assert('arrayOfIds', 'arrayOfIds name field can not be empty.').notEmpty();
	const errors = req.validationErrors();

	if (errors) {
		return res.send({status_code:400, status:'failure', message:errors})
	}

	// Request Data
	const arrayOfIds = req.body.arrayOfIds;

	subcategoryRepo.findSubcategoryWithIds(arrayOfIds)
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
}

 exports.activeSubCategory = async (req, res) => {
	 const id = req.params.id;
	 await subcategoryRepo.active(id).then(response=>{
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

 exports.deActiveSubCategory = async (req, res) => {
	 const id = req.params.id;
	 await subcategoryRepo.deActive(id).then(response=>{
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
