const BookBatch = require("../api/models/book_session");
const Iterator = require("../api/models/iterator");
const LiveSession = require("../api/models/livesession");
const User = require('../api/models/user');
const moment = require('moment-timezone');
const {localDateConverted, timeZoneList} = require("../utils/common");
const sgMail = require('../services/mail');
exports.fetchUserEmailList = async () => {
    const userCurrentTime = moment(new Date()).format('MMM DD YYYY h:mm a');
    try {
        let purchases = await BookBatch.find({}).lean();
        let batchIds = [];
        let sessionIds = [];
        let emailIds = [];

        purchases && purchases.length && purchases.map(purchase =>{
            sessionIds.push(purchase.LiveSessionId);
            batchIds.push(purchase.BatchId);
            emailIds.push(purchase.email);
        });

        batchIds = [...new Set(batchIds)];
        sessionIds = [...new Set(sessionIds)];
        emailIds = [...new Set(emailIds)];

        let sessionList = await LiveSession.find({"_id": {"$in": sessionIds}}).lean();
        let iteratorList = await Iterator.find({"batchId": {"$in": batchIds}}).lean();
        let userList = await User.find({"email": {"$in": emailIds}}).lean();
        purchases.map((purchase) => {
            const session = sessionList && sessionList.length && sessionList.filter(session => session._id == purchase.LiveSessionId);
            const user = userList && userList.length && userList.filter(user => user.email == purchase.email);
            purchase.title = session && session.length && session[0].title;
            purchase.timeZone = user && user.length && user[0].timeZone
        });

        purchases.map((purchase) => {
            let iterators = [];
            iteratorList.map((iterator) => {
                if(purchase.BatchId == iterator.batchId)
                    iterators.push(iterator)
            });
            purchase.iterator = iterators
        });

        purchases && purchases.length && purchases.map((purchase) => {
            purchase && purchase.iterator && purchase.iterator.length && purchase.iterator.map((iterator) => {
                const updatedTimings = localDateConverted(iterator,purchase.timeZone);
                iterator.date = updatedTimings.dateStartTime;
                iterator.duration = updatedTimings.duration;
                iterator.currentUserTime = userCurrentTime;
                iterator.hours = moment(updatedTimings.dateStartTime, 'MMM DD YYYY h:mm a').diff(userCurrentTime, 'hours');
            });

            const twoDays = 48;
            let iteratorList = [];
            purchase.iterator.map((iterator)=>{
                if(iterator.hours === twoDays)
                    iteratorList.push(iterator)
            });

            purchase.iterator = iteratorList
        });
        console.log("Hello")
        //Remove Batches having empty iterators
        purchases = purchases.filter(purchase => {
                if (purchase.iterator.length > 0)
                    return true
        });

        //Short iterators by date
        purchases.map(purchase => {
            purchase.iterator.sort((a, b)=> moment(a.date).isAfter(b.date));
        });

        //Generate Email Objects
        purchases.map(purchase => {
            let list ="<ul>";
            purchase.iterator.map((iterator, i)=>{
                list +=`<li key={${i}}>${iterator.date}</li>`;
            });
            list += "</ul>";
            const messages = {
                to: purchase.email,
                from: "vinit.webmigrates@gmail.com",
                subject: "Congrats! You have enrolled for the Live Session - "+purchase.title,
                text: "Congrats! You have enrolled for the Live Session - "+purchase.title,
                html: `Hello ${purchase.username || "-"}, <br/><br/>Your next Live Session interaction date is ${purchase && purchase.iterator && purchase.iterator[0] && purchase.iterator[0].date}<br/>You have enrolled for the Live Session - ${purchase.title} for the Batch starting.<br/>The batch schedule dates are<br/>${list}`
            };
            sgMail.sendgridMail(messages, (err, response) =>{
                if (err){
                    console.log("error----->>", err)
                }else {
                    console.log("success----->>")
                }
            });
        });
    }
    catch(e){
        console.log("error----->>>", e);
    }
};
