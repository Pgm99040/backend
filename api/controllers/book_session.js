const BookSession = require("../models/book_session");
const liveSession = require("../repository/liveSession");
const book_session = require("../repository/booksession");
const iterator = require("../repository/iterator");
const LiveSession = require("../models/livesession");
const async = require('async');
const sgSendMail = require('../../services/mail');
const moment = require('moment-timezone');
exports.bookSession = (req,res)=> {
    try{
        let location = req.body.timeZone;
        let bookDetails = {};
        let liveSessionDetails = {};
        let IteratorsList = [];
           delete req.body.timeZone;
            async.waterfall([
                function(callback) {
                    book_session.save(req.body).then(response =>{
                        bookDetails = response;
                        callback();
                    }).catch(err =>{
                        callback(err);
                    })
                },
                function (callback) {
                    liveSession.findIdWithSession(bookDetails && bookDetails.LiveSessionId).then(record=>{
                        if (record){
                            liveSessionDetails = record;
                            callback();
                        }
                    }).catch(err=>{
                        callback(err);
                    })
                },
                function (callback) {
                    iterator.findIteratorByBatchId(bookDetails && bookDetails.BatchId).then(data =>{
                        if (data){
                            IteratorsList = data;
                            callback();
                        }
                    }).catch(err =>{
                        callback(err);
                    })
                },
                function (callback) {
                    const dateList = IteratorsList && IteratorsList.length && IteratorsList.map((item, i) =>{
                        let date = moment(new Date(item.date)).utc(true).format('MMM DD YYYY');
                        return moment.tz(date, 'MMM DD YYYY h:mm a', location).format('MMM DD YYYY');
                    });
                    let list ="<ul>";
                    dateList && dateList.length && dateList.map((item, i) =>(list +=`<li key={${i}}>${item}</li>`));
                        list += "</ul>";
                    const messages = {
                        to: req.body.email,
                        from: "vinit.webmigrates@gmail.com",
                        subject: "Congrats! You have enrolled for the Live Session - "+liveSessionDetails.title,
                        text: "Congrats! You have enrolled for the Live Session - "+liveSessionDetails.title,
                        html: `Hello ${req.body.username || "-"}, <br/><br/>You have enrolled for the Live Session - ${liveSessionDetails.title} for the Batch starting.<br/>The batch schedule dates are<br/>${list}`
                    };
                     sgSendMail.sendgridMail(messages,  function(err, response){
                        if (err){
                            console.log("mail error----->>>", err);
                            callback(err);
                        } else {
                            console.log("mail success----->>>");
                            callback()
                        }
                    });
                }
            ], function(err, result) {
                if(err) {
                    return res.json({status_code:500, success: false, Error: err})
                }else {
                    return res.json({status_code:200, success: true, result})
                }
            })
            // var session = new BookSession(data);
            // await session.save(data).then(async response=>{
            //
            //     await sgSendMail.sendgridMail(messages, function (err, response) {
            //         if (err){
            //             console.log("mail error----->>>", err);
            //         } else {
            //             record = response
            //         }
            //     });
            //     res.status(200).send({msg: "success", response, mail: record});
            // }).catch(err =>{
            //     res.status(404).send({msg: "error", err});
            // })
    }catch(e){
        res.status(400).send({message : "error"})
    }
};

exports.getAllBookSession = async (req,res)=> {
    try{
        var response = await BookSession.find({});
        if (response){
            res.status(200).send({msg: "success", response});
        } else {
            res.status(404).send({msg: "failed"});
        }
    }catch(e){
        res.status(400).send({message : "error"})
    }
};

exports.getBookSession = async (req,res)=> {
    try{
        const id = req.params.id;
        var response = await BookSession.find({BatchId: id});
        if (response){
            res.status(200).send({msg: "success", response});
        } else {
            res.status(404).send({msg: "failed"});
        }
    }catch(e){
        res.status(400).send({message : "error"})
    }
};

exports.getAllBookSessionWithEmail = async (req,res)=> {
    const { email } = req.params;
    try{
        var response = await BookSession.find({email}).populate({path: "LiveSessionId"});
        if (response){
            res.status(200).send({msg: "success", success: true, response});
        } else {
            res.status(404).send({msg: "failed", success: false});
        }
    }catch(e){
        res.status(400).send({message : "error", success: false})
    }
};


