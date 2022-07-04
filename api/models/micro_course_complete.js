const mongoose = require("mongoose");

const MicroCourseComplete = mongoose.Schema({
    userId : String,
    courseId : String
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('Micro_Course_Complete', MicroCourseComplete);
