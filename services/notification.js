var exports = module.export = {};

exports.sendNotification = function(notification,token)
{
	console.log('mari'+token);
	if(token && global.activeUsers[token])
	{
		global.activeUsers[token].emit('notification',notification);
	}
	
	
}