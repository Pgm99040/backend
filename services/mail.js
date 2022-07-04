const dotenv = require("dotenv");
dotenv.config();
var propertiesFile = require('../config/index.js');
const configData = require('../config/db');
// const config = require('../chat/config');
//Send in blue

var sendinblue = require('sendinblue-api');
const sgMail = require('@sendgrid/mail');
  //const parameters = {apiKey: 'kbCU0WZYBvtn2D4y' }
  const parameters = {apiKey: propertiesFile.sendInBlueApiKey , timeout: propertiesFile.timeout}

  exports.sendMail = function(data, callback)
  { 
    var sendinObj = new sendinblue(parameters);
    var fromArray=['info@codeDIY.com', 'CodeDIY [Learn By Coding]'];

    const emailOptions = {
      to: { [data.to]: data.name},
      from :fromArray,
      subject: data.subject,  
      text: data.text,
      html:data.html,
    };

    sendinObj.send_email(emailOptions, function(err, response){
         if (err) {
            callback(err)
          }
          else{
            console.log(response)
            
            callback(null, response)
          }
    }); 
  };
sgMail.setApiKey(configData.SEND_GRID_API_KEY);
exports.sendgridMail = async (data, callback) =>{
    await sgMail.send(data).then(response =>{
        if (response){
            callback(null, response);
            console.log("Successfully send mail", response)
        }
    }).catch(e =>{
        console.log(e);
        callback(e)
    })
};