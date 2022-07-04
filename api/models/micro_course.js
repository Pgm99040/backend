const mongoose = require("mongoose");

const MicroCourse = mongoose.Schema({
    name : String,
    description : String,
    courseImageUrl : String,
    courseTagWords : String,
    courseAuthor : String,
    courseLanguage : String,
    coursePrice : Number,
    courseMarkDownPrice : Number,
    courseCurrencyCode : Number,
    courseCreatorName : String,
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Category"},
    subCategory: {type: mongoose.Schema.Types.ObjectId, ref: "Subcategory"},
    isActive : { type : Boolean,
        default: false},
},{
    timestamps: true,
    usePushEach: true
});
module.exports = mongoose.model('Micro_Course', MicroCourse);
