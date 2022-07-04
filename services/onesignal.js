  // =======================***** one signal -push notification ****================******************************
  
  var request = require('request');
  var https = require('https');
  var exports = module.exports = {};
  
  // Properties of app.
  var properties = require('../config/properties.js');

 // ONE SIGNAL APPID & RESTKEY B2C.
  var oneSignalAppId = properties.oneSignalAppId;
  var oneSignalRestKey = properties.oneSignalRestKey;
  var templateId = properties.templateId;

  //for driver.
  exports.sendNotification =  function (oneSignal_data,callback) {
    var result;
    oneSignal_data.app_id = oneSignalAppId;
    oneSignal_data.template_id = templateId;

    request({
        url: 'https://onesignal.com/api/v1/notifications',
        method: "POST",
        headers: {
                'Content-Type' : 'application/json',
                'Authorization': oneSignalRestKey
            },
        json : oneSignal_data   
      }, function (error, response, body) {
        if(error) {
          result={success:false, result:body, error:error}
        }
        else {
          result={success:true, response:body}
        }
        console.log(result)
      callback(result);      
    })
  }
 
  exports.updatePlayer = function(oneSignal_data, callback) {
    var result;
    var playerId = oneSignal_data.playerId;
    var gcmId = oneSignal_data.gcmId;
    request({
          url: 'https://onesignal.com/api/v1/players/'+playerId,
          method: "PUT",
          headers: {
                'Content-Type': 'application/json',
            },
            json: {
                //device one signal id: player id/notification player id
                id:playerId,
                app_id:oneSignalAppId,
                 //gcmID -push notification identifier. 
                identifier:gcmId,
                language:"en",
                 // Number of seconds away from UTC. Example: -28800
                timezone:+19800, 
                // App version
                game_version:"1.0", 
                //device_os:"",
                 //0 = iOS, 1 = Android, 2 = Amazon, 3 = WindowsPhone(MPNS). 
                device_type:1,       
                //device_model:""
            }

        }, function (error, response, body) {
          console.log(body)
          if(body.success==true) {
            result = {success:true};
          }
          else {
            result = {success:false};
          }         
      })
    callback(result);
  }
