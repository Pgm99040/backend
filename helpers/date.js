
/**
 * Created by Anil on 20/12/2016.
 */

// load the things we need
const moment = require('moment');


// Helper functions for dates.
var exports = module.exports = {}; 

// Checking the DoB in valid format - Must be DD/MM/YYYY.
exports.validateDOB = function(dob, callback) {
	
	let isCorrect =false;
   	var pattern =/^(0[1-9]|1[0-9]|2[0-9]|3[0-1])\/(0[1-9]|1[0-2])\/([0-9]{4})$/;
    if (dob == null || dob == "" || !pattern.test(dob)) {
       callback(null, isCorrect);
    } else {
        isCorrect=true
        callback(null, isCorrect);
    }
}

// Checking the DoJ (Date of Joining) in valid format - Must be DD/MM/YYYY.
exports.validateDOJ = function(dob) {
    let isCorrect =false;
    var pattern =/^(0[1-9]|1[0-9]|2[0-9]|3[0-1])\/(0[1-9]|1[0-2])\/([0-9]{4})$/;
    if (dob == null || dob == "" || !pattern.test(dob)) {
       callback(null, isCorrect);
    } else {
        isCorrect=true
        callback(null, isCorrect);
    }
}

// Check review hours 
exports.checkHoursBetween = function(data, callback) {
  
  console.log('checkHoursBetween: ')

  let format = 'hh:mm:ss';
  let startTime = data.startTime;
  let endTime = data.endTime;
  
  let isBetween = false;
  
  try {
        startTime = moment(startTime, format);
        endTime = moment(endTime, format);
        let currentTime =  moment().toISOString();
        //let currentTime = moment().add({hours:5, minutes:30});
        console.log('currentTime: '+ currentTime)

        
        console.log('startTime: '+ moment(startTime).format("h:mm:ss A"))
        console.log('endTime: '+ moment(endTime).format("h:mm:ss A"))

        //currentTime = moment.duration(currentTime); 
        console.log('currentTime: '+ currentTime)
        currentTime = currentTime.hours() + ":" + currentTime.minutes(); 
        currentTime  = moment(currentTime, format);
        console.log('currentTime: '+ moment(currentTime).format("h:mm:ss A"))

        if (currentTime.isBetween(startTime, endTime)) {
          console.log('is between');
          result.isBetween=true;
          callback(isBetween)
        } 
        else {
          console.log('is not between')
          callback(isBetween)    
        }
  }
  catch(err) {
    callback(err)
  }
}
