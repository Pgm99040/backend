// load the things we need
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

// define the schema for our employee model
var mentorSchema = new Schema({

  // Mandatory fields
  isApproved    : { type : Boolean, required : false, default : false },


   //bio
        mentorBio    : { type : String, required : false, default : false },
        currentPosition    : { type : String, required : false, default : false },
        imageUrl    : { type : String, required : false, default : false },

  //Defaoult mentors, when no mentors available, task will be assigned to this mentor if it is set to true
  isDefaultMentor : { type : Boolean, required : false, default : false },
  // Ratings
  averageRating : { type : Number, required : false, default : 0 },

  // Timestamps
  registeredOn  : { type : Date, default : Date.now },

  activeTaskCount  : { type : Number, required : false, default : 0 },

  // Relationships
  user : { type: mongoose.Schema.Types.ObjectId, ref: "User"},

  // Task Engegement
  approvedTasksForMentorship:[{ type: mongoose.Schema.Types.ObjectId, ref: "PredefinedTask",default:[]}],
  taskEngagements : [{ type: mongoose.Schema.Types.ObjectId, ref: "TaskEngagement"}],
  activeTasks      : [{ type: mongoose.Schema.Types.ObjectId, ref: "TaskEngagement"}],
  freeTasks       : [{ type: mongoose.Schema.Types.ObjectId, ref: "PredefinedTask"}],
  //review : [{ type: mongoose.Schema.Types.ObjectId, ref: "Review"}],

  assignDefaultMentor : { type : Boolean, required : false, default : false },

},
{
  timestamps: true,
  usePushEach: true
});


/**
 * Password hash middleware.
 */
mentorSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

/**
 * Helper method for validating Employee's password.
 */
 mentorSchema.methods.validPassword = function(password, callback) {
     bcrypt.compare(password, this.password, function(err, isMatch) {
        if(err) {
          return callback(err);
        }
          callback(null, isMatch)
      })
}

/**
 * Helper method for hide the fields in Json Response.
 */
 mentorSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.__v;
  return obj;
}

module.exports = mongoose.model('Mentor', mentorSchema);
