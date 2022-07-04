const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

const Job_Post = require("../models/jobPost");

// Required models ====================================
const JobPosts = mongoose.model('JobPosts');

exports.save = async(function (data) {
    return await(new Job_Post(data).save());
});

exports.active = async (function (id) {
    return await(Job_Post.findByIdAndUpdate({_id: id}, {isActive : true}));
})

exports.delete = async (function (id) {
    return await(Job_Post.findByIdAndUpdate({_id: id}, {isActive : false}));
})
