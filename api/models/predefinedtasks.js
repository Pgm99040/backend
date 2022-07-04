// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

// define the schema for our employee model
var predefinedTaskSchema = new Schema({
        // Mandatory fields
        name: {type: String, required: true, lowercase: false},
        mediaLink: {type: String, required: false, lowercase: false},
        tinyDescription: {type: String, required: false, lowercase: false},
        taskDetailedDescriptionForMentee: {type: String, required: false, lowercase: false},
        description: {type: String, required: true, lowercase: false},
        imageUrl: {type: String, required: false, lowercase: false},

        resources: {type: String, required: false, lowercase: false},

        price: [{
            currency: {type: String, required: true, default: "INR"},
            value: {type: Number, required: true, default: 0}
        }],

        credits: {type: Number, required: true, default: 0},
        noOfPeopleAttempted: {type: Number, required: true, default: 0},

        // enums
        difficultyLevel: {type: String, required: false, lowercase: false, enum: ['beginner', 'intermediate', 'advanced']},
        taskType: {type: String, required: true, lowercase: false, enum: ['paid', 'free']},

        currencyCode: {type: String, required: false, lowercase: false, default: "INR"},
        // taskMentor: { type: String, required: false, lowercase: false },

        // KnowledgeBlock related params
        relatedKnowledgeBlock: {type: String, required: false, lowercase: false},
        relatedCareerPath: {type: String, required: false, lowercase: false},

        // Relationships
        category: {type: mongoose.Schema.Types.ObjectId, ref: "Category"},
        subcategory: {type: mongoose.Schema.Types.ObjectId, ref: "Subcategory"},
        isActive : { type : Boolean},
        review:[{
            title:{type: String, required: true},
            description:{type: String, required: true}
        }]
        // Timestamps
    },
    {
        timestamps: true
    });
/**
 * Helper method for hide the password and __v fields  in Json Response.
 */
predefinedTaskSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.__v
    return obj;
}

module.exports = mongoose.model('PredefinedTask', predefinedTaskSchema);
