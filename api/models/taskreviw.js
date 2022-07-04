// load the things we need
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tasktaskreview = new Schema({
    TaskEngagementId:{type: mongoose.Schema.Types.ObjectId, ref: "TaskEngagement"},
    TaskReviewItemId:{type: mongoose.Schema.Types.ObjectId},
    MentorTaskReviewTextForReviewItem:{type: String, required: true}
});

module.exports = mongoose.model('tasktaskreview', tasktaskreview);
