
const fs = require('fs');
var exports = module.exports = {};
// const config = require('../config/index.js');
const config = require('../config/awsConfig');

exports.uploadToS3 = function (secondPath, file) {
    return new Promise(function(resolve, reject) {
        let this_uploadFile = file;
        let timestamp = Date.now();
        let originalFilename = timestamp+"-"+file.originalFilename;
        
        // IMPORTANT : No trailing '/' at the end of the last directory name
        let AWS = require('aws-sdk');
        let s3Client = new AWS.S3({
            signatureVersion: 'v2'
        });
    
        AWS.config.update({
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
            region :config.region
        });
    
        let bucket = new AWS.S3({
            params: {
                Bucket: config.s3bucket
            }
        });
    
        let contentToPost = {
            Key: secondPath+'/'+originalFilename, 
            Body: fs.createReadStream(this_uploadFile.path), 
            ContentEncoding: 'base64',
            ContentType: 'multipart/form-data',
            ServerSideEncryption: 'AES256',
            ACL: 'public-read',
        };
    
        bucket.upload(contentToPost, function (error, data) {
            if (error) {
                reject(error)
            }
            else {
                resolve(data)
            }  
        })
    })
};


