module.exports = {
  env: process.env.NODE_ENV || 'development',
 /* dburl: function() {
    var url = 'mongodb://';
    if (process.env.DB_USER && process.env.DB_PASS) {
      url = url + process.env.DB_USER + ':' + process.env.DB_PASS + '@'
    }
    url = url + process.env.DB_HOST  + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME + '?authSource=admin';
    return url
  },*/
  dburl: function() {
    //url ="mongodb://52.52.176.11:20707/codeDIY-dev";
     //url = "mongodb+srv://anil:password123!@codediyprddbcluster1-fxuyf.mongodb.net/test";

//url = "mongodb+srv://DBUser1/Z9RbKlHuns3cQyO8@cluster0.vgm2y.mongodb.net/codeDiy?retryWrites=true&w=majority";

// url = "mongodb+srv://<username>:<password>@codediyprddbcluster1.fxuyf.mongodb.net/<dbname>?retryWrites=true&w=majority";
//url  = "mongodb://DBUser1:Z9RbKlHuns3cQyO8@codediyprddbcluster1-shard-00-00.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-01.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-02.fxuyf.mongodb.net:27017/<dbname>?ssl=true&replicaSet=CodeDIYPrdDBCluster1-shard-0&authSource=admin&retryWrites=true&w=majority";


// url = "mongodb+srv://@codediyprddbcluster1.fxuyf.mongodb.net/codeDiy?retryWrites=true&w=majority";

url  = "mongodb://DBUser1:password123$@codediyprddbcluster1-shard-00-00.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-01.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-02.fxuyf.mongodb.net:27017/codediy-prod?ssl=true&replicaSet=CodeDIYPrdDBCluster1-shard-0&authSource=admin&retryWrites=true&w=majority"

//url = "mongodb://<username>:<password>@codediyprddbcluster1-shard-00-00.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-01.fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-02.fxuyf.mongodb.net:27017/<dbname>?ssl=true&replicaSet=CodeDIYPrdDBCluster1-shard-0&authSource=admin&retryWrites=true&w=majority
//url = "mongodb://anil:password123!@codediyprddbcluster1-shard-00-00-fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-01-fxuyf.mongodb.net:27017,codediyprddbcluster1-shard-00-02-fxuyf.mongodb.net:27017/codeDiy?ssl=true&replicaSet=CodeDIYPrdDBCluster1-shard-0&authSource=admin&retryWrites=true";

// for compass 3.15
//mongodb+srv://anil:@codediyprddbcluster1-fxuyf.mongodb.net/admin 


    //url = "mongodb+srv://anil:password123!@codediyprddbcluster1-fxuyf.mongodb.net/test?retryWrites=true";

  //  url ="mongodb://localhost/codeDiy";

    //'db': 'mongodb://localhost/code-diy'

    return url
  },
  sendInBlueApiKey : process.env.sendInBlueApiKey || 'jZRUspnkt503hKdJ',  
 	sendInBlueTimeout:  process.env.sendInBlueTimeout || 5000 ,	
  //adminEmail : "admin@codediy.com",
         adminEmail :"team@codediy.com" ,
  apiHost: process.env.API_HOST,
  apiBaseUrl:process.env.API_BASE_URL,
  testToken:process.env.TEST_TOKEN,
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASS
  },
  masterToken:process.env.MASTER_TOKEN || 'somethingJwtserctKey#@adfasf',
  sendMail: process.env.SEND_MAIL === 'true',
  sendSms: process.env.SEND_SMS === 'true',
  jwtSecretKey: process.env.JWT_SECRET_KEY || 'somethingJwtserctKey#@adfasf',
  // googleClientId: "288860329802-50qejgg5l52cef8ln5bl7bja0maso66c.apps.googleusercontent.com",
  // clientSecret: "fRnEc_U2tpShtDE2BJDuUDRQ",
  googleClientId: "641779018898-4sgibngtpdvtm2cq1l7g0gupc5icd6rk.apps.googleusercontent.com",
  clientSecret: "ujS5q_RpGpPm-STI_fYmP71A",
  // --- KnowledgeLocker ----
  // s3BaseUrl: 'https://s3.amazonaws.com/codediy/',
  // accessKeyId: 'AKIAIDRO7Y43FRJS26FA',
  // secretAccessKey: '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',
  // region : 'us-east-1',
  // s3bucket: 'codediy',
  
  // --- CodeDIY ----
  s3BaseUrl: 'https://s3.amazonaws.com/codediydev/',
  accessKeyId: 'AKIAJTMXDRZLZWUWW5WA',
  secretAccessKey: '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',
  region : 'us-east-1',
  s3bucket: 'codediydev',
};
