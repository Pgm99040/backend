const multer = require('multer');
const mkdirp = require('mkdirp');
const path = require('path');

module.exports.getUploadHandler = function(destination, fieldName, fileName) {
  var storage = multer.diskStorage({
    destination: function(req, file, callback) {
      mkdirp(destination, err => callback(err, destination));
    },
    filename: function(req, file, callback) {
      fileName = fileName + path.extname(file.originalname);
      callback(null, fileName);
    }
  });
  var uploader = multer({
    storage: storage
  }).single(fieldName)
  return uploader;
}
