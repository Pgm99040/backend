const mongoose = require("mongoose");
const {ObjectId} = require('mongoose');

const TEST = mongoose.Schema({
    TestId: {
        type: mongoose.Schema.Types.ObjectId,
        default: new ObjectId()
    },
    TestName:{type : String, required : true},
    TestName_URLEncoded:{type : String, required : true},
    TestDescription:{type : String, required : true},
    MCQCount:{type:Number,default : 0},
    MCQQuestionsTimeLimit_Mins:{type:Number,default : 60},
    MultipleChoiceQuestion:[{
        answers:[{MultipleChoiceAnswerId: {
            type: mongoose.Schema.Types.ObjectId,
            default: new mongoose.Types.ObjectId()
        },
        MultipleChoiceAnswerText:{type : String},
        IsCorrectAnswer:{type :Boolean},
        AnswerKeyText:{type : String, default : null}}],
        multiChoiceQuestionId:{
            type: mongoose.Schema.Types.ObjectId,
            default: new mongoose.Types.ObjectId()
        },
        Question:{type : String}
    }],
    selectCetegory:{type: mongoose.Schema.Types.ObjectId, ref: "Category"},
    subcategory:{type: mongoose.Schema.Types.ObjectId, ref: "Subcategory"},
    TestImg:{type : String}
},{
    timestamps: true,
});
module.exports = mongoose.model('TEST', TEST);
