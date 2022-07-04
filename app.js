'use strict';

const SwaggerExpress = require('swagger-express-mw');
const express = require('express');
const Sentry = require("@sentry/node");
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const moment     = require('moment');
const compression = require('compression');
const winston = require('winston');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const util = require('util');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const helmet = require('helmet');
const url  = require('url');
const morgan =require('morgan');
const cors = require('cors');
const fs = require('fs');
const async = require('async');
const jwt = require('jwt-simple');
const CronJob = require('cron').CronJob;
const {fetchUserEmailList} = require('./services/cronJob');
const errors = require('./utils/').errors
const app = express();

// added to take values from .env file into node's process.env

const dotenv = require("dotenv");
dotenv.config();

// load required configuration files ==============================================
const responses = require('./utils/responses');
const config = require('./config');
const configData = require('./config/db');
const logger = require('./logger');
const logFormat = '[:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms';
const cryptoService = require('./services/crypto.js');
const syncServiceDetails = require('./chat/sync_service_details');

if (config.env == 'production') {
  const accessLogStream = fs.createWriteStream(path.join(__dirname, 'api.log'), {
    flags: 'a'
  });
  app.use(morgan(logFormat, {
    stream: accessLogStream
  }));
} else {
  // Setup console logger for dev environment.
  app.use(morgan(logFormat));
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());
syncServiceDetails();
const SwaggerConfiguration = {
  appRoot: __dirname, // required config
};

Sentry.init({ dsn: "https://a3647f3a3808459aa788b0e3cbc5eaf0@o1099665.ingest.sentry.io/6124445" });
app.use(Sentry.Handlers.requestHandler());

SwaggerExpress.create(SwaggerConfiguration, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  const port = process.env.PORT || 8080;
  app.listen(port);

 /* if (swaggerExpress.runner.swagger.paths['/']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }*/
});

// MongDB Configuration ===================================================================
// mongoose
mongoose.Promise = global.Promise;
mongoose.connect(configData.URI, {
   //useMongoClient: true
   useNewUrlParser: true,
   useUnifiedTopology: true ,
   useCreateIndex: true,
  useFindAndModify: false
});// connect to our database
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongdDB Connection error:'));
db.once('open', function(db,err) { console.log("MongoDB Connected Via Mongoose Successfully!")});

// Cron JOB=================================================================================
new CronJob('0 0 */1 * * *', async function () {
  await fetchUserEmailList()
}, null, true, 'Asia/Calcutta');
// new CronJob('* * * * * *', async function () {
//   await fetchUserEmailList()
// }, null, true, 'Asia/Calcutta');
// *****************************************************************************************
// Required models ========================================================================
const Admin = require('./api/models/admin');
const User = require('./api/models/user');
const Mentor = require('./api/models/mentor');
const Category = require('./api/models/category');
const Subcategory = require('./api/models/subcategory');
const PredefinedTask = require('./api/models/predefinedtasks');
const TaskEngagement = require('./api/models/taskengagement');
const Payment = require('./api/models/payment');
const CreditPayment = require('./api/models/creditpayment');
const FeedModel = require('./api/models/feed');

// Required Controllers ========================================================================
const adminController = require('./api/controllers/admin');
const userController = require('./api/controllers/user');
const mentorController = require('./api/controllers/mentor');
const categoryController = require('./api/controllers/category');
const subcategoryController = require('./api/controllers/subcategory');
const predefinedTaskController = require('./api/controllers/predefinedtask');
const TaskEngagementController = require('./api/controllers/taskengagement');
const PaymentController = require('./api/controllers/payment');
const LiveSessionController = require('./api/controllers/livesession');
const Iterator = require('./api/controllers/iterator');
const LiveSessionRating = require('./api/controllers/instructor_ratings');
const LiveSessionReview = require('./api/controllers/livesession_review');
const BookSession = require('./api/controllers/book_session');
const Instructor = require('./api/controllers/session_instructor');
const FeedController = require('./api/controllers/feed');
const MicroCourseController = require('./api/controllers/micro_course');
const MicroLessonController = require('./api/controllers/micro_lesson');
const MicroCourseCompleteController = require('./api/controllers/micro_course_complete');
const MicroLessonCompleteController = require('./api/controllers/micro_lesson_complete');
const CoursePaymentController = require('./api/controllers/course_payment');
const Blog = require('./api/controllers/blog');
const JobPost = require('./api/controllers/jobPost');
const CodeCast = require('./api/controllers/code_cast');
const ExportGuidance = require('./api/controllers/exportGuidance');
const ExportGuidanceSubscriber = require('./api/controllers/exportGuidanceSubscribers');
const taskItemReview = require('./api/controllers/taskReview');
const TEST=require('./api/controllers/TEST')
const TestSlectAns=require('./api/controllers/TestSelectAns')
const JobPostingPromotions=require('./api/controllers/JobPostingPromotions')
const StoreData=require('./api/controllers/StoreData')


const tokenGenerator = require('./chat/token_generator');
const configFile = require('./chat/config');
//=========================================================================================
//const jwtauth = require('./services/jwtauth.js');
const authenticate = require('./middlewares').authenticate;
app.all('/api/v1/*', [bodyParser.urlencoded({ extended: false }), authenticate('user')]);
app.all('/admin/api/v1/*', [bodyParser.urlencoded({ extended: false }), authenticate('admin')]);
//=========================================================================================

const tokens = require('./api/models/tokens');

const middleWare = (req, res, next) => {
        let header = req.header('Authorization');
        if (!header) {
            throw new Error(errors.tokenMissing);
            next({
                validation: false,
                message: errors.tokenMissing
            });
        }
        return tokens.verifyAndRefreshTokenForNonAuth(header)
            .then(data => {
                req.token = data.token;
                req.user = data.user;
                next();
            })
            .catch(err => {
                logger.error('Error occurred while authenticating : ' + err);
                next({
                    validation: false,
                    message: errors.genericError
                });
            });
};


/**
* Index.
*/


//cors-error handling---------->
app.use(function(req, res, next) { //allow cross origin requests
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});


app.get('/', function(req,res){
  res.send("OK");
});


//Chat Application ================================
app.get('/api/token/:id?', (req, res) => {
    console.log(`${req.params.id} is Adding a Discussion to the Task Engagement. ${new Date()}:`);
    Sentry.addBreadcrumb({
        category: "auth",
        message: `${req.params.id} is Adding a Discussion to the Task Engagement. ${new Date()}:`,
        level: Sentry.Severity.Info,
    });
  const id = req.params.id;
  if (id !== "" || id !== undefined || id !== null) {
    res.send(tokenGenerator(id));
  }else {
    res.send({msg: "error, please pass in email"})
  }
});

app.post('/api/token', (req, res) => {
  const id = req.body.id;
  if (id !== "" || id !== undefined || id !== null) {
    res.send(tokenGenerator(id));
  }else {
    res.send({msg: "error, please pass in email"})
  }

});

app.get('/api/config', (req, res) => {
  res.json(configFile);
});


// Admin routes =================================
app.post('/addAdmin', adminController.addAdmin);
app.post('/adminLogin', adminController.adminLogin);

//mobile googleAuth
app.post('/mobileGoogleLogin', adminController.mobileGoogleLogin);

//metee login
app.post("/menteelogin",adminController.menteeLogin);

// Category
app.post('/admin/api/v1/category/add', categoryController.addCategory);
app.post('/admin/api/v1/category/update', categoryController.updateCategory);
app.get('/admin/api/v1/category/view/:id', categoryController.viewCategory);
app.get('/admin/api/v1/category/list', categoryController.listCategory);
app.get('/admin/api/v1/category', categoryController.AllListCategory);
app.get('/admin/api/v1/categoryIdBySubcategory/:id', categoryController.categoryIdSubcategory);
app.get('/admin/api/v1/categoryIdBySubcategoryAdmin/:id', categoryController.categoryIdSubcategoryAdmin);
app.post('/admin/api/v1/category/findCategoryWithIds', categoryController.findCategoryWithIds);
app.post('/admin/api/v1/category/findCategoryWithIds', categoryController.findCategoryWithIds);
app.get('/admin/api/v1/getSessions', LiveSessionController.getSessions);
app.get('/admin/api/v1/getBatches/:id', LiveSessionController.getBatches);
app.post('/admin/api/v1/addBatches/:sessionId', LiveSessionController.addBatches);
app.put('/admin/api/v1/updateBatches', LiveSessionController.updateBatch);
app.put('/admin/api/v1/liveSession/:id/removeBatches/:batchId', LiveSessionController.removeBatchById);
app.post('/admin/api/v1/createIterator', Iterator.createIterator);
app.put('/admin/api/v1/editIterator/:id', Iterator.editIterator);
app.get('/admin/api/v1/getIterator', Iterator.getAllIterator);
app.get('/admin/api/v1/getIteratorByBatch/:batchId', Iterator.getIteratorByBatch);
app.delete('/admin/api/v1/removeIterator/:id', Iterator.removeIterator);
app.delete('/admin/api/v1/activeSession/:id', LiveSessionController.activeSession);
app.delete('/admin/api/v1/deActiveSession/:id', LiveSessionController.deActiveSession);

app.delete('/admin/api/v1/activeCategory/:id', categoryController.activeCategory);
app.delete('/admin/api/v1/deActiveCategory/:id', categoryController.deActiveCategory);


//app.get('/admin/api/v1/category/delete/:id', categoryController.deleteCategory);

// Subcategory
app.post('/admin/api/v1/subcategory/add', subcategoryController.addSubCategory);
app.post('/admin/api/v1/subcategory/update', subcategoryController.updateSubcategory);
app.get('/admin/api/v1/subcategory/view/:id', subcategoryController.viewSubcategory);
app.get('/admin/api/v1/subcategory/list', subcategoryController.listSubcategory);
app.post('/admin/api/v1/subcategory/findSubcategoryWithIds', subcategoryController.findSubcategoryWithIds);
app.delete('/admin/api/v1/activeSubCategory/:id', subcategoryController.activeSubCategory);
app.delete('/admin/api/v1/deActiveSubCategory/:id', subcategoryController.deActiveSubCategory);

//instructor --------------------------

app.get('/admin/api/v1/getInstructor', Instructor.getInstructor);
app.post('/admin/api/v1/addInstructor', Instructor.addInstructor);

//app.get('/admin/api/v1/subcategory/delete/:id', subcategoryController.deleteSubcategory);

// Predefined Tasks
app.post('/admin/api/v1/predefinedtask/add', predefinedTaskController.addPredefinedTask);
app.delete('/admin/api/v1/predefinedtask/deleteTask/:id', predefinedTaskController.deletePredefinedTask);
app.delete('/admin/api/v1/predefinedtask/activeTask/:id', predefinedTaskController.activePredefinedTask);
app.post('/admin/api/v1/predefinedtask/bulkInsert', predefinedTaskController.bulkInsert);
app.post('/admin/api/v1/predefinedtask/update', predefinedTaskController.updatePredefinedTask);
app.get('/admin/api/v1/predefinedtask/view/:id', predefinedTaskController.viewPredefinedTask);
app.get('/admin/api/v1/predefinedtaskDetail/view/:id', predefinedTaskController.viewPredefinedTaskDetail);
app.get('/admin/api/v1/predefinedtask/list', predefinedTaskController.listPredefinedTask);
app.delete('/admin/api/v1/predefinedtask/delete/:id/:taskId', predefinedTaskController.deleteCategory);

app.post('/admin/api/v1/addBonusCredits',adminController.addBonusCredits);
app.get('/admin/api/v1/getAllActiveUsers', adminController.getAllUser);
app.get('/admin/api/v1/getSearchByUser/:email', adminController.getFindEmailByUser);
app.get('/admin/api/v1/getAllMentors', adminController.getAllMentors);
app.get('/admin/api/v1/getSearchByMentor/:email', adminController.getFindEmailByMentor);
app.get('/admin/api/v1/becomeMentor/:userId', adminController.becomeMentors);
app.get('/admin/api/v1/predefinedtask/records/:id', predefinedTaskController.recordPredefinedTask);
app.get('/admin/api/v1/predefinedtaskList', predefinedTaskController.listPredefinedTask);
app.post('/admin/api/v1/addTaskInMentorList/:id', predefinedTaskController.addPredefinedTaskInMentor);
app.get('/admin/api/v1/getMentorAssignTaskWithStatus/:id', predefinedTaskController.mentorAssignTaskTaskEngagement);
app.get('/admin/api/v1/taskEngagementList', TaskEngagementController.taskEngagementList);
app.put('/admin/api/v1/userLoginStatus/:id', adminController.userLoginAccess);
app.post('/admin/api/v1/createLiveSession', LiveSessionController.createLiveSession);
app.put('/admin/api/v1/updateLiveSession', LiveSessionController.updateLiveSession);
app.post('/admin/api/v1/adminGrantCredits',userController.adminGrantCredits);
app.get('/admin/api/v1/predefinedtask/getreview/:id',predefinedTaskController.getwatchReview);
app.put('/admin/api/v1/predefinedtask/review/:id',predefinedTaskController.predefinedTaskControllerReview)
app.put('/admin/api/v1/updateMentor/:id', mentorController.updateMentor);
app.get('/admin/api/v1/getMentorBio', mentorController.getAllMentorBio);

//feed
app.post('/admin/api/v1/createFeed', FeedController.createFeed);
app.put('/admin/api/v1/updateFeed', FeedController.updateFeed);
app.get('/admin/api/v1/getFeed', FeedController.getAllFeed);
app.delete('/admin/api/v1/activeFeed/:id', FeedController.activeFeed);
app.delete('/admin/api/v1/deActiveFeed/:id', FeedController.deActiveFeed);

//micro course
app.post('/admin/api/v1/createMicroCourse', MicroCourseController.createMicroCourse);
app.put('/admin/api/v1/updateMicroCourse', MicroCourseController.updateMicroCourse);
app.get('/admin/api/v1/getMicroCourse', MicroCourseController.getAllCourse);
app.delete('/admin/api/v1/activeMicroCourse/:id', MicroCourseController.activeCourse);
app.delete('/admin/api/v1/deActiveMicroCourse/:id', MicroCourseController.deActiveCourse);

//Blog
app.post('/admin/api/v1/createBlog', Blog.createBlog);
app.get('/admin/api/v1/getBlog', Blog.getAllBlog);
app.put('/admin/api/v1/updateBlog', Blog.updateBlog);
app.delete('/admin/api/v1/activeBlog/:id', Blog.activeBlog);
app.delete('/admin/api/v1/deActiveBlog/:id', Blog.deActiveBlog);

//Export Guidance
app.post('/admin/api/v1/createExpertGuidance', ExportGuidance.createExportGuidance);
app.get('/admin/api/v1/exportGuidance', ExportGuidance.getAllExportGuidance);
app.put('/admin/api/v1/updateExportGuidance', ExportGuidance.updateExportGuidance);

app.get('/admin/api/v1/exportGuidanceSubscriber', ExportGuidanceSubscriber.getAllExportGuidanceSubscriber);

//Code Cast
app.get('/admin/api/v1/codeCast', CodeCast.getAllCodeCast);
app.post('/admin/api/v1/createCodeCast', CodeCast.createCodeCast);
app.put('/admin/api/v1/updateCodeCast', CodeCast.updateCodeCast);
app.delete('/admin/api/v1/activeCodeCast/:id', CodeCast.activeCodeCast);
app.delete('/admin/api/v1/deActiveCodeCast/:id', CodeCast.deActiveCodeCast);

//Lesson
app.post('/admin/api/v1/createLesson', MicroLessonController.createMicroLesson);
app.get('/admin/api/v1/getLessons/:id', MicroLessonController.getLessons);
app.put('/admin/api/v1/updateLesson', MicroLessonController.updateLesson);

//job post
app.post('/admin/api/v1/createJobPost', JobPost.createJobPost);
app.put('/admin/api/v1/updateJobPost', JobPost.updateJobPost);
app.get('/admin/api/v1/getJobPost', JobPost.getAllJobPost);
app.delete('/admin/api/v1/activeJobPost/:id', JobPost.activeJobPost);
app.delete('/admin/api/v1/deActiveJobPost/:id', JobPost.deActiveJobPost);

// User routes =================================
// const tokens = require('./api/models/tokens');
//For applogic authentication on the dashboard to authenticate the user from our end.
app.get('/authenticate/api/validate', function(req, res) {
    const token = req.query.userToken;
    if(token) {
      const role = "user";
      let anyOf;
      tokens.verifyAndRefreshToken(token,{role,anyOf})
      .then(data => {
        return res.json({
          validation: true,
        });
      })
      .catch(err => {
        logger.error('Error occurred while authenticating : ' + err);
        return res.json({
          validation: false,
        });
      });
    }else {
      logger.error('Authorization Header missings');
      throw new Error(errors.tokenMissing);
      return res.json({
        validation: false,
        error: "Token is missing..!!"
      });
    }

})
//test
app.get('/admin/api/v1/getAllTest', TEST.getAllTest);
app.post("/admin/api/v1/postTest",TEST.postTest);
app.get("/admin/api/v1/getRendomTest/:testId",TEST.getRendomTest)
app.put("/admin/api/v1/postMcqQuestion/:testId",TEST.postMcqQuestion);
app.delete('/admin/api/v1/MCQTests/DeleteTest/:testId',TEST.getSelectDeleteMCQtest)

//job promoted user list admin
app.get('/admin/api/v1/getJobpostpromotion', JobPostingPromotions.getJobpostpromotion);
app.post('/admin/api/v1/getJobpostpromotionUser', JobPostingPromotions.getJobpostpromotionUser);

//store data

app.post('/postStordata',StoreData.createStoreData)
app.get('/getAllStoredata',StoreData.getAllStoreData)

//get token test
app.post("/getUserToken",userController.getUserToken);
//=================================
app.get('/api/v1/getAllMentors', adminController.getAllMentor);


app.post('/userLogin', userController.userLogin);
app.post('/googleAuth', userController.googleLogin);
app.post('/api/v1/profileUpdate', userController.profileUpdate);
app.post('/api/v1/editProfile',userController.editProfile);
app.post('/api/v1/findUserName',userController.findUserName);
app.post('/api/findUserIdByName',userController.findUserIdByName);
app.post('/api/getMentorIdByUsername',mentorController.getMentorIdByUsername);

app.post('/api/v1/getCreditsOfUser',userController.getCredits);

app.post('/api/v1/imageUpload',multipartMiddleware,userController.imageUpload);

app.get('/api/mentee-profile/:userId',userController.getProfileDetails);
app.get('/api/mentor-profile/:mentorId',mentorController.getProfileDetails);

app.get('/api/v1/becomeMentor/:userId', userController.becomeMentor);
app.post('/api/v1/category/findCategoryWithIds', categoryController.findCategoryWithIds);
app.post('/api/v1/subcategory/findSubcategoryWithIds', subcategoryController.findSubcategoryWithIds);
app.post('/api/v1/requestForTask', userController.requestForTask);
app.post('/api/v1/purchaseCredits',userController.purchaseCredits);
app.post('/api/v1/checkMentorsAvailability', userController.checkMentorsAvailability);
app.get('/api/v1/user/te/getActiveTasks/:userId', userController.getActiveTask);
app.get('/api/v1/logout/:userId', userController.logout);
app.get('/api/v1/findMentorWithId/:id', mentorController.getMentorWithId);

//job promoted

app.post('/api/v1/jobpostpromotion', JobPostingPromotions.createJobPostingPromotions);


//Get Instructor
app.get('/api/v1/getInstructors', Instructor.getInstructor);

app.post('/api/v1/taskPurchase', TaskEngagementController.isPurchasedOrNot);

//Live-session-------------------------
app.get('/api/v1/getBatches/:title', LiveSessionController.getBatches);
app.post('/api/getBatchesList', LiveSessionController.getAllBatchesList);
app.get('/api/v1/purchaseBatches/:id', LiveSessionController.purchaseBatchesSeats);
// app.get('/api/v1/purchaseLiveSession/:email', LiveSessionController.purchaseLiveSession);
app.post('/api/v1/getPurchasedSessionsForUser', LiveSessionController.purchaseBatches);
app.get('/api/v1/getIteratorByBatch/:batchId', Iterator.getIteratorByBatch);
app.get('/api/getAllLiveSession', LiveSessionController.getAllSession);
app.get('/api/v1/fetchAllLiveSessions/:email', LiveSessionController.fetchAllSession);
app.get('/api/v1/findIdWithLiveSession/:id', LiveSessionController.findIdWithSession);
app.get('/api/v1/findAndSortBatch/:title', LiveSessionController.findAndSortBatch);
app.get('/api/v1/findLiveSession/:title', LiveSessionController.findLiveSession);

app.post('/api/v1/requestForCourse', CoursePaymentController.requestForCourse);

app.get('/api/v1/getAllMicroCourse', MicroCourseController.getCourse);
app.get('/api/v1/getCourseDetail/:id', MicroCourseController.getMicroCourseDetail);
app.get('/api/v1/Course/:id/GetCourseDetailsWithLessonSummary', MicroCourseController.getCourseLessonDetail);

app.get('/api/v1/Lesson/:id/LessonContent', MicroLessonController.getLessonContent);

app.post('/api/v1/Course/:id/CompleteCourse', MicroCourseCompleteController.courseCompleteStatus);
app.post('/api/v1/Lesson/:id/CompleteLesson', MicroLessonCompleteController.LessonCompleteStatus);

//codecast
app.get('/api/v1/codeCast', CodeCast.getCodeCast);

//Live session rating--------------------
app.post('/api/v1/addRating', LiveSessionRating.addSessionRate);
app.get('/api/v1/getAvgRating/:sessionId', LiveSessionRating.getRatings);

// Live-Session review------------------------
app.post('/api/v1/addReview', LiveSessionReview.addReview);

//book session-------------------
app.post('/api/v1/bookSession', BookSession.bookSession);
app.get('/api/v1/getAllBookingSession', BookSession.getAllBookSession);
app.get('/api/v1/getBookingSession/:id', BookSession.getBookSession);
app.get('/api/v1/getAllBookingSessionWithEmail/:email', BookSession.getAllBookSessionWithEmail);


// No Auth --------------------------------------------------------------------------------------------
app.get('/api/category/list', categoryController.listCategory);
app.get('/api/category/view/:id', categoryController.viewCategory);
app.post('/api/category/findCategoryWithIds', categoryController.findCategoryWithIds);

app.get('/api/subcategory/list', subcategoryController.listSubcategory);
app.get('/api/subcategory/view/:id', subcategoryController.viewSubcategory);
app.post('/api/subcategory/findSubcategoryWithIds', subcategoryController.findSubcategoryWithIds);

app.get('/api/predefinedtask/records/:id', predefinedTaskController.recordPredefinedTask);
app.get('/api/predefinedtask/list', predefinedTaskController.listPredefinedTask);
app.get('/api/predefinedtask/view/:id',middleWare, predefinedTaskController.viewPredefinedTask);
app.get('/api/predefinedtaskDetail/view/:id', predefinedTaskController.viewPredefinedTaskDetail);
app.post('/api/predefinedtask/listWithOptions', predefinedTaskController.listPredefinedTaskWithOptions);
app.post('/api/predefinedtask/searchTask', predefinedTaskController.searchTask);
app.post('/api/predefinedtask/sortByOptions', predefinedTaskController.sortByOptions);

// Task Engagement routes =================================
app.post('/api/v1/te/submission', multipartMiddleware,  TaskEngagementController.submission);
app.post('/api/v1/te/discussion', TaskEngagementController.discussion);
app.get('/api/v1/te/user/mytask/:id', TaskEngagementController.userTasks);
app.get('/api/v1/te/mentor/mytask/:id', TaskEngagementController.mentorTasks);
app.get('/api/v1/te/view/:id', TaskEngagementController.taskEngagementDetail);
app.get('/api/v1/te/getReview/:id', TaskEngagementController.taskReviewDetail);
app.post('/api/v1/te/addGmeetLink/:id', TaskEngagementController.createGmeetLink);
app.post('/api/v1/te/endTask', TaskEngagementController.endTask);
app.post('/api/v1/te/rate/mentorToUser', TaskEngagementController.mentorToUserRating);

app.get('/api/v1/te/MentorTaskReviewFeedbackItemsForTaskEngagementId/:id', TaskEngagementController.taskMentorReviewDetail);


app.post('/api/v1/te/taskreview', taskItemReview.taskEngagementtaskreview);
app.get('/api/v1/te/gettaskreview/:id', taskItemReview.taskEngagementgettaskreview);
app.post('/api/v1/te/updatetaskreview/:id', taskItemReview.taskEngagementupdatetaskreview);


// Mentor routes =================================
app.get('/api/v1/mentor/te/getActiveTasks/:mentorId', mentorController.getActiveTask);
// Payment routes =================================
app.get('/api/v1/user/payment/history/:id', PaymentController.userPaymenthistory);
app.get('/api/v1/mentor/payment/history/:id', PaymentController.mentorPaymenthistory);
app.get('/api/v1/isTaskPurchased/:id/user/:userId', PaymentController.isTaskPurchased);
app.get('/api/v1/taskPurchasedForUsers', PaymentController.taskPurchasedForUsers);

app.get('/api/v1/getFeed', FeedController.getFeed);

app.get('/api/v1/getBlog', Blog.getBlog);

app.get('/api/v1/getJobPost', JobPost.getJobPost);
app.get('/api/v1/isUserEligibleForJobPostingPromotion/:id',middleWare, JobPost.userEligibleForJobPostingPromotion);

app.get('/api/v1/getBlogDetail/:id', Blog.getBlogDetail);

app.put('/api/v1/blog/:id/updateComment', Blog.updateCommentForBlog)

app.get('/api/v1/getExportGuidance', ExportGuidance.getExportGuidance);

app.post('/api/v1/createExportGuidanceSubscriber', ExportGuidanceSubscriber.addExportGuidanceSubscriber);

//-------------------------------------------------------------------------------------------------------
// Views
// Reset password
app.get('/reset/:email', function(req, res, next) {
	const email = req.params.email;
		res.render('reset', {
		email: email
	});
});

//test user

app.get('/api/v1/getMCQtest',TEST.getMCQtest)
app.get('/api/v1/MCQTests/Test/:testId',TEST.getSelectMCQtest)

//test answer
app.post('/api/v1/addSelectAns',TestSlectAns.createTestSelectAns)
app.get('/api/v1/getAnsTest/:testId', TestSlectAns.getAnsTest);


// Reset password succussful page
app.get('/reset-password-succuss', function(req, res) {
	res.render('reset-password-succuss.ejs');
});

app.use(Sentry.Handlers.errorHandler());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("catch 404 and forward to error handler----------------", req);
  logger.error('URL Not found: ' + req.path);
  const err = new Error(errors.genericError);
  console.log("catch 404 and forward to error handler---err-------------", err);
  next(err);
});

// Generic error handler
app.use(function(err, req, res, next) {
  res.status(200);
  console.log("Generic error handler--------", err);
  if (err.name === 'JsonSchemaValidation'|| err.name === 'ValidationError') {
    logger.error('Validation Error occurred: ', err.validations,err);
    res.json(responses.getErrorResponse(errors.genericError));
  } else {
    res.json(responses.getErrorResponse(err.message));
  }
});

app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + "\n");
});
module.exports = app;
