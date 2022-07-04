const Twilio = require('twilio');
require('dotenv').config();

function syncServiceDetails() {
    const syncServiceSid = process.env.TWILIO_SYNC_SERVICE_SID || 'default';

    const client = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        "7797761a2a7ea981313f2dd20901e2fd",
        // process.env.TWILIO_API_KEY,
    );
    client.sync
        .services(syncServiceSid)
        .fetch()
        .then(response => {
            console.log("----------->>>", response);
        })
        .catch(error => {
            console.log("error------>>>", error);
        });
    
}

module.exports = syncServiceDetails;