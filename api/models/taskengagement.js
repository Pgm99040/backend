// load the things we need
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

// define the schema for our employee model
var taskEngagementSchema = new Schema({
  // Mandatory fields 
  status :  { type : String, required : false, lowercase : false, default: 'started', enum : ['started','inprogress','completed']},

  IsMentorAssigned : { type : Boolean, required : false, default : false },

  // set to true if user want to be anonymous
  isAnonymous : { type : Boolean, required : false, default : false },

  taskType : { type: String, required: false, lowercase: false, enum: ['paid','free'] },

  isPaid : { type : Boolean, required : false, default : false },
   
  // Timestamps
  startDate : { type : Date, default : null },
  endDate   : { type : Date, default : null },

  // Ratings
  rating: {
    user2mentor  : { type : Number, required : false, default: 0 },
    mentor2user  : { type : Number, required : false, default: 0 },
  },
  comment: {
    user2mentor: {type: String, require: false, default: null},
    mentor2user: {type: String, require: false, default: null}
  },
  feedback : {
    userFeedback: { type : String, required : false, lowercase : false, default: null},
    mentorFeedback: { type : String, required : false, lowercase : false, default: null},
  },
  mentor2userReview: { type : Boolean, required : false, default: false},
  taskCompletionReason: { type : String, required : false, lowercase : false, default: null},

  submissions: [{
    fileUrl     : { type : String, required : false, lowercase : false, default: null},
    description : { type : String, required : false, lowercase : false, default: null},
    submittedBy : { type : String, required : false, lowercase : false, default: null, enum: ["user", "mentor","null"]},
    createdAt   : { type: Date, default: Date.now}
  }],

  discussions: [{
    fileUrl     : { type : String, required : false, lowercase : false, default: null },
    description : { type : String, required : false, lowercase : false, default: null },
    postedBy   : { type : String, required : false, lowercase : false, default: null, enum: ["user", "mentor","null"]},
    createdAt   : { type: Date, default: Date.now}
  }],
  gmeetLinkUrl: { type: String, default: null },

  // Relationships
  task    : { type: mongoose.Schema.Types.ObjectId, ref: "PredefinedTask" },
  user    : { type: mongoose.Schema.Types.ObjectId, ref: "User" },    
  mentor  : { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" },    
  payment : { type: mongoose.Schema.Types.ObjectId, ref: "Payment"}, 
},
{
  timestamps: true,
  usePushEach: true
});
/**
 * Helper method for hide the password and __v fields  in Json Response.
 */
taskEngagementSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.__v
  return obj;
}

module.exports = mongoose.model('TaskEngagement', taskEngagementSchema);