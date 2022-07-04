// load the things we need
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

// define the schema for our employee model
var categorySchema = new Schema({
   // Mandatory fields  
  name        : { type : String, required : true, lowercase : false,}, 
  description : { type : String, required : false, lowercase : false,},   
  isActive : { type : Boolean},

  // Timestamps 
  subcategories : [{ type: mongoose.Schema.Types.ObjectId, ref: "Subcategory"}], 

},
{
  timestamps: true
});
/**
 * Helper method for hide the password and __v fields  in Json Response.
 */
 categorySchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.__v
  return obj;
}

module.exports = mongoose.model('Category', categorySchema);