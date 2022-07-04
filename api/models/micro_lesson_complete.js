const mongoose = require("mongoose");

const MicroLessonComplete = mongoose.Schema({
    userId : String,
    lessonId : String
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('Micro_Lesson_Complete', MicroLessonComplete);
