const mongoose = require("mongoose");

const LiveSessionReview = mongoose.Schema({
  title: { type: String, require: true},
  name: { type: String, require: false},
  date: { type: String, require: true},
  stars: { type: Number, require: true},
  description: { type: String, require: true},
  email: { type: String, require: true},
  user: String,
  livesession: String
  // livesession: {type: mongoose.Schema.Types.ObjectId, ref: "LiveSession"}
  // rating: {type: mongoose.Schema.Types.ObjectId, ref: "instructor_rating"}
},{
  timestamps: true,
  usePushEach: true
});
module.exports = mongoose.model('LiveSessionReview', LiveSessionReview);
