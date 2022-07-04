const mongoose = require("mongoose");

const JobPosts = mongoose.Schema({
    jobTitle: String,
    jobRole: String,
    city: String,
    company:String,
    country: String,
    jobDescription: String,
    jobApplicationURL: String,
    taskRequire: [{
        taskCategory: {type: mongoose.Schema.Types.ObjectId, ref: "Category"},
        taskSubCategory: {type: mongoose.Schema.Types.ObjectId, ref: "Subcategory"},
        numOfTask: Number
    }],
    isActive : { type : Boolean,
        default: false},
    remote : { type : Boolean,
        default: false},
    CompanyRecruitercontactemail:String
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('JobPosts', JobPosts);
