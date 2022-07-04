const async = require('asyncawait/async');
const await = require('asyncawait/await');

let mongoose = require('mongoose');

const JobPostingPromotions = require("../models/JobPostingPromotions");

// Required models ====================================
const Job_Posting_Promotions = mongoose.model('JobPostingPromotions');

exports.save = async(function (data) {
    return await(new JobPostingPromotions(data).save());
});