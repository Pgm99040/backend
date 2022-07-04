// load the things we need
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

// define the schema for our employee model
var userSchema = new Schema({

  // Mandatory fields  
  firstName: { type: String, required: true, lowercase: false },
  lastName: { type: String, required: false, lowercase: false },

  userName:{type:String}, 
  // Required for login, email must be unique. 
  email: { type: String, required: true, lowercase: true, index: { unique: true } },
  password: { type: String, required: false, min: 6, max: 15 },
  status: {type: Boolean, default: true},

  credits: { type: Number, default: 0 },

  bonusCreditDetails: [{
    credits: { type: Number },
    creditedDate: { type: Date },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
  }],


  // Location details of the user/mentor.
  country: { type: String, required: false, lowercase: false },
  city: { type: String, required: false, lowercase: false },
  zipCode: { type: String, required: false, lowercase: false },

  // working details of the user/mentor
  company: { type: String, required: false, lowercase: false, default: null },
  companyLocation: { type: String, required: false, lowercase: false, default: null },
  currentFieldOfStudy: { type: String, required: false, lowercase: false },
  currentWorkTitle: { type: String, required: false, lowercase: false },

  // set to true, if the user is also a mentor.
  isMentor: { type: Boolean, required: false, default: false },
  // set to true if user want to be anonymous
  isAnonymous: { type: Boolean, required: false, default: false },

  isProfileUpdated: { type: Boolean, required: false, default: false },


  // Additional fields
  gender: { type: String, required: false, lowercase: false, enum: ['male', 'female'] },
  designation: { type: String, required: false, lowercase: false },
  dateOfBirth: { type: String, required: false, lowercase: false, default: null },
  aboutMe: { type: String, required: false, lowercase: false, default: null },

  // User profile and cover pic url which are captured during social login. 
  profilePicUrl: { type: String, required: false, default: null },
  coverPicUrl: { type: String, required: false, default: null },

  linkedInUrl: { type: String, required: false, default: null },
  githubUrl: { type: String, required: false, default: null },
  googleUrl : { type : String, required : false, default : null },
  calendarUrl: { type : String, required : false, default : null },
  // Ratings
  averageRating: { type: Number, required: false, default: 0 },
  activeTaskCount: { type: Number, required: false, default: 0 },
  // Additional Fields 
  socialLoginInfo: {
    authenticatingSite: { type: String, required: false, lowercase: false, trim: true, enum: ['facebook', 'google+', 'linkedIn', 'null'], default: 'null' },
    authToken: { type: String, required: false, default: null },
  },

  preferredLanguages: [{
    lang: { type: String },
    fluency: { type: String }
  }],

  
  expertise: [String],

  // Timestamps 
  registeredOn: { type: Date, default: Date.now },
  lastLoggedIn: { type: Date, default: null },
  timeZone: { type: String, default: null },
  lastLoggedOut: { type: Date, default: null },

  isLoggedIn: { type: Boolean, required: false, default: false },

  // Relationships
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" },
  taskEngagements: [{ type: mongoose.Schema.Types.ObjectId, ref: "TaskEngagement" }],
  activeTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "TaskEngagement" }],
  freeTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "PredefinedTasks" }],
  education: {
    degree: { type: String ,default:""},
    college: { type: String ,default:""},
    graduatedYear: { type: String,default:"" }
  },

  github: [{
    projectTitle: { type: String },
    projectUrl: { type: String },
    description: { type: String }
  }],

  leetcode: [{
    publicProfileLink: { type: String },
    description: { type: String },
    screenshot: { type: String }
  }],
  competitiveProgramming: [
    {
      type: { type: String },
      contestName: { type: String },
      contestDate: { type: Date },
      description: { type: String },
      screenshot: { type: String }
    }
  ],

  sideProject: [
    {
      projectTitle: { type: String },
      projectLink: { type: String },
      description: { type: String },
      screenshot: { type: String }
    }
  ]
},
  {
    timestamps: true,
    usePushEach: true
  });

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({
    email: email
  }).exec();
}
/**
 * Password hash middleware.
 */
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

/**
 * Helper method for validating user's password.
 */
userSchema.methods.validPassword = function (password, callback) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) {
      return callback(err);
    }
    callback(null, isMatch)
  })
}

/**
 * Helper method for hide the fields in Json Response.
 */
userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
}

module.exports = mongoose.model('User', userSchema);