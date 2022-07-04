const mongoose = require("mongoose");

const MicroLesson = mongoose.Schema({
    microCourseID : { type: mongoose.Schema.Types.ObjectId, ref: "Micro_Course"},
    lessonName : String,
    lessonDescription : String,
    lessonImageUrl : String,
    microLessonContent : String,
    lessonTags : String,
    lessonOrder : Number
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('Micro_Lesson', MicroLesson);
