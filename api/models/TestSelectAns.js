const mongoose = require("mongoose");

const TestSelectAns = mongoose.Schema({
    testId:{type:String,required: true},
    selected_answer:[{
        question_id: {type: String, required: true},
        selected_answer_ids: {type: Array, required: true},
        answer_key_text: {type: Array, required: true}
    }],
},{
    timestamps: true,
    usePushEach: true
});

module.exports = mongoose.model('TestSelectAns', TestSelectAns);
