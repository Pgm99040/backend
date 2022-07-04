module.exports = {
    apps : [{
        name   : "codediy-backend",
        script : "./app.js",
        env_production: {
            NODE_ENV: "production",
            TWILIO_ACCOUNT_SID: "AC8eafd0c253817f33b2c25c7e32e35eb1",
            TWILIO_API_KEY: "SKac96ec40660e5b3ccab690fe13e40814",
            TWILIO_API_SECRET: "aYu2NDkNUR3CZZCPebtTlZJ9b3mWZUu4",
            TWILIO_CHAT_SERVICE_SID: "IS2f968dfa6fe74050990652a505a22172",
            // TWILIO_API_KEY: "SKd477a7154c318c7e1bdf7bcb3c5882e2",
            // TWILIO_API_SECRET: "7797761a2a7ea981313f2dd20901e2fd",
            // TWILIO_CHAT_SERVICE_SID: "IS95daaeaf06a64596b923ae1ebf40dc16",
            TWILIO_NOTIFICATION_SERVICE_SID: "ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            TWILIO_SYNC_SERVICE_SID: "ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",

            //    send grid
            SEND_GRID_API_KEY: "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"
        },
        env_development: {
            NODE_ENV: "development",
            TWILIO_ACCOUNT_SID: "AC8eafd0c253817f33b2c25c7e32e35eb1",
            TWILIO_API_KEY: "SKac96ec40660e5b3ccab690fe13e40814",
            TWILIO_API_SECRET: "aYu2NDkNUR3CZZCPebtTlZJ9b3mWZUu4",
            TWILIO_CHAT_SERVICE_SID: "IS2f968dfa6fe74050990652a505a22172",
            // TWILIO_API_KEY: "SKd477a7154c318c7e1bdf7bcb3c5882e2",
            // TWILIO_API_SECRET: "7797761a2a7ea981313f2dd20901e2fd",
            // TWILIO_CHAT_SERVICE_SID: "IS95daaeaf06a64596b923ae1ebf40dc16",
            TWILIO_NOTIFICATION_SERVICE_SID: "ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            TWILIO_SYNC_SERVICE_SID: "ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",

            //    send grid
            SEND_GRID_API_KEY: "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"
        }
    }]
};