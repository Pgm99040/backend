require('dotenv').config();
const config = {
    production: {
        URI: "mongodb://DBUser1:password123$@codediyprddbcluster1-shard-00-00.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-01.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-02.fxuyf.mongodb.net:27017/codediy-prod?ssl=true&replicaSet=CodeDIYPrdDBCluster1-shard-0&authSource=admin&retryWrites=true&w=majority",
        TWILIO_ACCOUNT_SID: "ACbff7bf57b3b5de9b5d248fa509933a02",
        TWILIO_API_KEY: "SK64f69422fca4644e88a439cab34dede9",
        TWILIO_API_SECRET: "Hzge65YAHqQr4Rtgf2wsVQQPrqilYXVX",
        TWILIO_CHAT_SERVICE_SID: "IS0d873be4469e479eae45fc0a8f14231f",
        TWILIO_NOTIFICATION_SERVICE_SID: process.env.TWILIO_SYNC_SERVICE_SID,
        TWILIO_SYNC_SERVICE_SID: process.env.TWILIO_SYNC_SERVICE_SID || 'default',
        //  send grid
        SEND_GRID_API_KEY:  "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",
        //google credentials
        googleClientId: "641779018898-4sgibngtpdvtm2cq1l7g0gupc5icd6rk.apps.googleusercontent.com",
        clientSecret: "ujS5q_RpGpPm-STI_fYmP71A",
        jwtSecretKey: process.env.JWT_SECRET_KEY || 'somethingJwtserctKey#@adfasf'
    },
    staging: {
        URI: "mongodb://DBUser1:password123$@codediyprddbcluster1-shard-00-00.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-01.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-02.fxuyf.mongodb.net:27017/codediy-stg?ssl=true&replicaSet=CodeDIYPrdDBCluster1-shard-0&authSource=admin&retryWrites=true&w=majority",
        TWILIO_ACCOUNT_SID: "ACbff7bf57b3b5de9b5d248fa509933a02",
        TWILIO_API_KEY: "SK64f69422fca4644e88a439cab34dede9",
        TWILIO_API_SECRET: "Hzge65YAHqQr4Rtgf2wsVQQPrqilYXVX",
        TWILIO_CHAT_SERVICE_SID: "IS0d873be4469e479eae45fc0a8f14231f",
        TWILIO_NOTIFICATION_SERVICE_SID: process.env.TWILIO_SYNC_SERVICE_SID,
        TWILIO_SYNC_SERVICE_SID: process.env.TWILIO_SYNC_SERVICE_SID || 'default',
        //  send grid
        SEND_GRID_API_KEY:  "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",
        //google credentials
        googleClientId: "641779018898-4sgibngtpdvtm2cq1l7g0gupc5icd6rk.apps.googleusercontent.com",
        clientSecret: "ujS5q_RpGpPm-STI_fYmP71A",
        jwtSecretKey: process.env.JWT_SECRET_KEY || 'somethingJwtserctKey#@adfasf'
    },
    development: {
        URI: "mongodb://DBUser1:password123$@codediyprddbcluster1-shard-00-00.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-01.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-02.fxuyf.mongodb.net:27017/codediy-stg?ssl=true&replicaSet=CodeDIYPrdDBCluster1-shard-0&authSource=admin&retryWrites=true&w=majority",
        TWILIO_ACCOUNT_SID: "ACbff7bf57b3b5de9b5d248fa509933a02",
        TWILIO_API_KEY: "SK64f69422fca4644e88a439cab34dede9",
        TWILIO_API_SECRET: "Hzge65YAHqQr4Rtgf2wsVQQPrqilYXVX",
        TWILIO_CHAT_SERVICE_SID: "IS0d873be4469e479eae45fc0a8f14231f",
        TWILIO_NOTIFICATION_SERVICE_SID: process.env.TWILIO_SYNC_SERVICE_SID,
        TWILIO_SYNC_SERVICE_SID: process.env.TWILIO_SYNC_SERVICE_SID || 'default',
        //  send grid
        SEND_GRID_API_KEY:  "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",
        //google credentials
        googleClientId: "641779018898-4sgibngtpdvtm2cq1l7g0gupc5icd6rk.apps.googleusercontent.com",
        clientSecret: "ujS5q_RpGpPm-STI_fYmP71A",
        jwtSecretKey: process.env.JWT_SECRET_KEY || 'somethingJwtserctKey#@adfasf'
    }
};
console.log("process.env.NODE_ENV", process.env.NODE_ENV)
const configData = config[process.env.NODE_ENV || "development"];
module.exports = configData;
