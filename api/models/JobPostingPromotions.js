const mongoose = require("mongoose");

const JobPostingPromotions = mongoose.Schema({
    Useremail: String,
    JobPostingId: {type: mongoose.Schema.Types.ObjectId, ref: "JobPosts"},
    PromotedDate : { type : Date, default : Date.now}
},{
    timestamps: true,
});
module.exports = mongoose.model('JobPostingPromotions', JobPostingPromotions);
