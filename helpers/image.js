const fs = require('fs');

// Helper functions for images.
var exports = module.exports = {}; 

exports.uploadImage = function(req, path, callback) {
	
	let result = {status:'failure', image_url:null, isImageAttached:false, error: null};
	let set_image_location = null;
	let set_image_target_path = null;
	
	if(path=='user_profile') {
		set_image_location = '/images/employee-profile-pics/';
		set_image_target_path = './public/images/employee-profile-pics/';
	}

	try {
		if(req.files.image) {
			//image access location
			let image_location =  set_image_location;
			
			//image target path - saving path
			let image_target_path = set_image_target_path

			//saving temporary path of all images 
			let image_tmp_path = req.files.image.path;
			
			let image_name = Date.now() + req.files.image.name;

			//strip out special characters in filename
			image_name = image_name.replace(/[^\.\w\s]/gi, "");

			let image_url =  image_location + image_name;
			
			// set where the file should actually exists - in this case it is in the "images" directory
			image_target_path = image_target_path + image_name;
			
			// move the file from the temporary location to the intended location
			fs.rename(image_tmp_path, image_target_path, function(err)  {
				if (err) {
					//return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
					result.error=err;
					callback(result)	
				}
				// delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
				fs.unlink(image_tmp_path, function() {
					if (err)  {
						console.log(err)
					}
					else {
						result.status='succuss';
						result.image_url=image_url;
						result.isImageAttached=true;
						callback(result)	
					}
				});
			});
		}
	else {
		console.log(result)
		callback(result)	
		//return res.json({status_code:405, status:'failure', message:'Please select a file to upload.'})
	}
			
	}				
	catch(err) {
		console.log(result)
		result.error=err;
		//return res.json({status_code:500, status:'failure', message:'Internal Server Error.',Error: err})
	}
}