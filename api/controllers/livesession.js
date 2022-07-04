const LiveSession = require("../models/livesession");
const liveSession = require("../repository/liveSession");
const Instructor = require("../models/session_instructor");
const Iterator = require("../models/iterator");
const BookBatch = require("../models/book_session");
const {timeZoneList} = require("../../utils/common");
const moment = require('moment-timezone');
const ObjectId = require('mongodb').ObjectID;
exports.createLiveSession = async (req, res) => {
    try {
        const title = req.body.title;
        let changeTitle = title.replace(/ /g, "-");
        req.body.isActive = true;
        const obj = {
            ...req.body,
            slug: changeTitle
        }
        await liveSession.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.updateLiveSession = async (req, res) => {
    try {
        await LiveSession.findByIdAndUpdate({_id : req.body._id}, req.body);
        res.send({msg: "done", success : true})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getAllSession = async (req, res) => {
    await liveSession.getAll().then(response => {
        res.status(200).send({msg: "success", success: true, response});
    }).catch(err => {
        console.log("error----->>", err);
        res.status(404).send({msg: "error", success: false});
    })
};

exports.findIdWithSession = async (req, res) => {
    const id = req.params.id;
    await liveSession.findIdWithSession(id).then(response => {
        console.log("res-------------->>>>", response);
        res.status(200).send({msg: "success", success: true, response});
    }).catch(err => {
        console.log("error----->>", err);
        res.status(404).send({msg: "error", success: false});
    })
};


exports.getSessions = async (req, res) => {
    try {
        const data = await LiveSession.find({})
            .populate({path: 'category'})
            .populate({path: 'subCategory'});
        res.send({msg: "done", data})

    } catch (e) {
        console.log("e", e)
        res.status(400).send({msg: "fail"})
    }
}

exports.getBatches = async (req, res) => {
    console.log("req.body------>>>", req.params.id, req.params.title);
    const id = req.params.id;
    const search = id ? {_id: req.params.id} : {title: req.params.title};
    try {
        const data = await LiveSession.findOne(search);
        const instructorList = await Instructor.find({});
        let iterator = await Iterator.find({});
       let result = [];
        data && data.batches && data.batches.length && data.batches.map((item, i) =>{
            const iteratorDetail = iterator && iterator.length && iterator.filter(iterate => String(iterate.batchId) === String(item._id));
          instructorList && instructorList.length && instructorList.forEach(val =>{
                if ((val._id).toString() == item.instructorId){
                    let details = {
                        name: val.name,
                        bio: val.bio,
                        meetLink: val.meetLink,
                        batchDescription: item.batchDescription,
                        capacityOfSeats: item.capacityOfSeats,
                        instructorId: item.instructorId,
                        iterators: iteratorDetail,
                        batchUrlName: item.batchUrlName,
                        _id: item._id
                    };
                    result.push(details);
                }
            })
        });
        // console.log("req.params", result)

        res.send({msg: "sucess", data: result})

    } catch (e) {
        res.status(400).send({msg: "fail", e})
    }
}

exports.addBatches = async (req, res) => {
    const id = req.params.sessionId;
    console.log("batches-------->>>", req.body);
    let result = [];
    try {
        // const data1 = { $addToSet: { batches:{$each: req.body} }};
        const data = await LiveSession.findOne({_id: id});
        const back = data && data.batches && data.batches;
        const mapped = back.reduce((a,t)=> (a[t.instructorId] = t, a), {}),
            // mapped2 = req.body.reduce((a,t)=> (a[t.instructorId] = t, a), {});
         result = Object.values({...mapped, ...req.body});
        const instructorData = await liveSession.findByIdAndUpdate(id, result);
        console.log("data--------->>>>", instructorData);
        if (instructorData) {
            res.send({msg: "sucess", data: instructorData})
        }
    } catch (e) {
        console.log("E", e)
        res.status(400).send({msg: "fail"})
    }
};

exports.updateBatch = async (req, res) => {
    try {
        await LiveSession.updateOne({
            "batches._id" : req.body._id
        },{
            $set : {
                "batches.$[index].instructorId" : req.body.instructorId,
                "batches.$[index].batchDescription" : req.body.batchDescription,
                "batches.$[index].batchUrlName" : req.body.batchUrlName
            }
        },{
            arrayFilters: [
                {"index._id": req.body._id}
            ]
        });
        res.send({msg: "done", success : true})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.removeBatchById = async (req, res) =>{
    let id = req.params.batchId;
    let session_id = req.params.id;
    const data = { $pull: { "batches": { _id: id }} };
    console.log("data------------->>>", data)
    await liveSession.removeBatch(session_id, data).then(response =>{
        res.status(200).send({success: true, response});
    }).catch(e =>{
        res.status(400).send({success: false, e});
    });
};

exports.findAndSortBatch = async (req, res) => {
    const title = req.params.title;
    await liveSession.sortBatchSession(title).then(response => {
        if (response) {
            res.status(200).send({msg: true, result: response});
        } else {
            res.status(404).send({msg: false});
        }
    }).catch(e => {
        console.log("error---------->>>>", e);
    })
};
exports.findLiveSession = async (req, res) => {
    const title = req.params.title;
    const InstructorData = await Instructor.find({});
    await liveSession.findIdWithSession(title).then(response => {
        const allBatchesInstructorId = []
        const batches = response.batches;

        batches && batches.length && batches.map((item) => {
            const instructorId = item.instructorId
            allBatchesInstructorId.push.apply(allBatchesInstructorId, instructorId)
        })
        const uniqAllBatchesInstructorId = [...new Set(allBatchesInstructorId)];
        var finalUpcommingBatch = [];
        uniqAllBatchesInstructorId && uniqAllBatchesInstructorId.length && uniqAllBatchesInstructorId.map((batchInstructorId) => {
            const temp = InstructorData.filter(function (el) {
                return el._id == batchInstructorId
            });
            //console.log('---->Batches for id:',temp[0].name,':',temp[0].bio,'<------')
            var batchStore = [];
            batches && batches.length && batches.map((item, index) => {
                const instructorId = item.instructorId;
                if (instructorId.includes(batchInstructorId)) {
                    batchStore.push(item)
                }
            });
            var upcomingBatches = {
                user: temp[0],
                batches: batchStore
            };
            finalUpcommingBatch.push(upcomingBatches)
        });
        if (finalUpcommingBatch) {
            res.status(200).send({success: true, finalUpcommingBatch})
        } else {
            res.status(400).send({success: false, msg: "something went wrong"})
        }
    }).catch(e => {
        console.log("error----->>", e);
        res.status(500).send({success: false})
    })
};

exports.fetchAllSession = async (req, res) =>{
    let email = req.params.email;
    try {
        let finalArray = [];
        let details = [];
        let record = [];
        let instructorWithBatch = [];
        let liveSessionObj = {};
        let purchaseBatch = [];
        let booksBatchList = [];
        const allSessions = await liveSession.getAll();
        const bookBatch = await BookBatch.find({email});
        let iterator = await Iterator.find({});
        const instructorList = await Instructor.find({});
        let bookingSession = [];
        bookBatch && bookBatch.length && bookBatch.map(book =>{
            bookingSession.push(book.LiveSessionId);
        });
        const uniqAllLiveSessionId = [...new Set(bookingSession)];
        console.log("uniqAllLiveSessionId", uniqAllLiveSessionId);

        uniqAllLiveSessionId && uniqAllLiveSessionId.length && uniqAllLiveSessionId.map(id =>{
            const liveSession = allSessions && allSessions.length && allSessions.filter(val => (val._id).toString() == id);
            finalArray.push(liveSession[0]);
        });
        if (finalArray && finalArray.length){
            finalArray && finalArray.length && finalArray.map((item, i) =>{
                purchaseBatch = [];
                bookBatch && bookBatch.length && bookBatch.map(book =>{
                    booksBatchList = item && item.batches && item.batches.length && item.batches.filter(val => (val._id).toString() == book.BatchId);
                    booksBatchList.length > 0 && purchaseBatch.push(booksBatchList[0])
                });
                item.batches = purchaseBatch;
                details.push(item);
            });
        }
        if (details && details.length){
            details && details.length && details.map((item, i) =>{
                let instructorsLists = [];
                item && item.batches && item.batches.length && item.batches.map(ele =>{
                    const instructorDetail = instructorList && instructorList.length && instructorList.filter(item => String(item._id) === String(ele.instructorId));
                    const iteratorDetail = iterator && iterator.length && iterator.filter(iterate => String(iterate.batchId) === String(ele._id));
                    if(instructorDetail.length > 0){
                        let obj = {
                            name: instructorDetail[0].name || '',
                            bio: instructorDetail[0].bio || '',
                            batchDescription: ele.batchDescription,
                            capacityOfSeats: ele.capacityOfSeats,
                            instructorId: ele.instructorId,
                            iterateList: iteratorDetail || [],
                            _id: ele._id
                        };
                        instructorsLists.push(obj);
                    }
                });
                record.push({...item._doc, batches: instructorsLists});
            });
        }
        res.status(200).send({success: true, result: record});
    } catch (e) {
        console.log("error----->>>", e);
        res.status(400).send({success: false, e});
    }
};

// exports.purchaseBatches = async (req, res) =>{
//     const email = req.params.email;
//     try {
//         const result = await BookBatch.aggregate([
//             {
//                 $set: {
//                     LiveSessionId: {
//                         $toObjectId: "$LiveSessionId"
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "livesessions",
//                     localField: "LiveSessionId", //this is the _id user from tests
//                     foreignField: "_id", //this is the _id from users
//                     as: "sessions"
//                 }
//             },
//             {
//                 $unwind: "$sessions"
//             },
//             {
//                 $match: {
//                     "email": email
//                 },
//             },
//             {
//                 $set: {
//                     LiveSessionId: {
//                         $toString: "$LiveSessionId"
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$LiveSessionId",
//                     sessions: {
//                         $first: "$sessions"
//                     }
//                 }
//             },
//             {
//                 $replaceRoot: {
//                     newRoot: "$sessions"
//                 }
//             },
//             {
//                 $unwind: "$batches"
//             },
//             {
//                 $set: {
//                     batches: {
//                         _id: {
//                             $toString: "$batches._id"
//                         }
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "booksessioons",
//                     localField: "batches._id",
//                     foreignField: "BatchId",
//                     as:"ignore"
//                 }
//             },
//             {
//                 $unwind: "$ignore"
//             },
//             { $unset: [ "ignore"] },
//             {
//                 $group: {
//                     _id: {
//                         _id:"$_id",
//                         title: "$title",
//                         price: "$price",
//                         description: "$description",
//                     },
//                     batches: {
//                         $addToSet: "$batches"
//                     }
//                 }
//             },
//             { $project : { session : "$_id", batches : "$batches",_id:0} },
//             {
//                 $lookup: {
//                     from: "iterators",
//                     localField: "batches._id",
//                     foreignField: "batchId",
//                     as: "batches.iterator"
//                 }
//             },
//             // { $project : { session : "$_id", batches : "$batches",_id:0} }
//
//
//             // { $project : { session : "$_id", batches : "$batches",_id:0} },
//             // {$unwind: "$batches"},
//             //
//             // {$set: {batchId: {$toString: "$batches._id"}}},
//             // {
//             //     $lookup: {
//             //         from: "iterators",
//             //         localField: "batches._id",
//             //         foreignField: "batchId",
//             //         as: "batches.iterator"
//             //     }
//             // }
//     ]);
//         if (result){
//             res.status(200).send({success: true, result});
//         } else {
//             res.status(400).send({success: false});
//         }
//     } catch (e) {
//         console.log("error--->", e);
//         res.status(500).send({success: false, e});
//     }
//
//         // if (data){
//         //     res.status(200).send({success: true, result: data});
//         // } else {
//         //     res.status(400).send({success: false});
//         // }
//
//
// };

exports.purchaseBatches = async (req, res) => {
    let {email, location, date, sessionType} = req.body;
    console.log("date11----->>>>", date);
    date = moment(date).utc(true).format('MMM DD YYYY h:mm a');
    date = moment.tz(date, 'MMM DD YYYY h:mm a', location).format('MMM DD YYYY h:mm a');
    console.log("date----->>>>", date);
    try {
        let userBookedSession = [];
        const temp = await BookBatch.find({email: email});
        if (temp) {
            temp && temp.length > 0 && temp.map((item) => userBookedSession.push(item.LiveSessionId));
            userBookedSession = [...new Set(userBookedSession)];
        }
        var result = await LiveSession.aggregate([
            {
                $set: {
                    _id: {$toString: "$_id"}
                }
            },
            {$match: {"_id": {"$in": userBookedSession}}},
        ]);
        let instructorId = [];
        result && result.length && result.map(item => {
            item.batches = item.batches.filter(tempItem1 => {
                const ifExist = temp.filter(tempItem2 => {
                    tempItem1.name = '';
                    tempItem1.bio = '';
                    if (tempItem2.BatchId == tempItem1._id) {
                        instructorId.push(tempItem1.instructorId);
                        return true
                    } else
                        return false
                });
                if (ifExist.length > 0) {
                    return true
                } else return false
            })
        });

        instructorId = [...new Set(instructorId)];
        let instructorDetails = await Instructor.aggregate([
            {
                $set: {
                    _id: {$toString: "$_id"}
                }
            },
            {$match: {"_id": {"$in": instructorId}}},
        ]);
        result && result.length > 0 && result.map(item => {
            item.batches = item.batches.filter(tempItem1 => {
                const ifExist = temp.filter(tempItem2 => {
                    tempItem1.name = instructorDetails.filter(instructorId => tempItem1.instructorId == instructorId._id)[0].name;
                    tempItem1.bio = instructorDetails.filter(instructorId => tempItem1.instructorId == instructorId._id)[0].bio;
                    if (tempItem2.BatchId == tempItem1._id) {
                        instructorId.push(tempItem1.instructorId);
                        return true
                    } else
                        return false
                });
                if (ifExist.length > 0) {
                    return true
                } else return false
            })
        });
        let batchId = [];
        result.map(session => {
            session.batches.map(batch => {
                batchId.push(batch._id)
                batch.iterator = []
            })
        });
        let batchDetails = await Iterator.find({"batchId": {"$in": batchId}});
        result.map(session => {
            session.batches.map(batch => {
                batchId.push(batch._id);
                let batchIterator = [];
                batchDetails.map(batchItem => {
                    const filterTimezone = timeZoneList && timeZoneList.filter(ele => ele.name === batchItem._doc.timeZone);
                    if (session._id == batchItem.sessionId && batch._id == batchItem.batchId) {
                        let iteratorDate = batchItem._doc.date;

                        iteratorDate = moment(iteratorDate).utc(false).format('MMM DD YYYY h:mm a');
                        iteratorDate = moment(iteratorDate).tz(filterTimezone && filterTimezone[0] && filterTimezone[0].value, true).format('MMM DD YYYY h:mm a');
                        let dateStartTime = moment(iteratorDate).format('MMM DD YYYY');
                        let dateEndTime = moment(iteratorDate).format('MMM DD YYYY');
                        const startTime = batchItem._doc.duration.split('-')[0];
                        const endTime = batchItem._doc.duration.split('-')[1];
                        dateStartTime = moment(dateStartTime + ' ' + startTime).format('MMM DD YYYY h:mm a');
                        dateEndTime = moment(dateEndTime + ' ' + endTime).format('MMM DD YYYY h:mm a');
                        dateStartTime = moment.tz(dateStartTime, 'MMM DD YYYY h:mm a', filterTimezone && filterTimezone[0] && filterTimezone[0].value).tz(location).format('MMM DD YYYY h:mm a');
                        dateEndTime = moment.tz(dateEndTime, 'MMM DD YYYY h:mm a', filterTimezone && filterTimezone[0] && filterTimezone[0].value).tz(location).format('MMM DD YYYY h:mm a');
                        const dateStartTimeAMPM = moment(dateStartTime).format('h:mm a');
                        const dateEndTimeAMPM = moment(dateEndTime).format('h:mm a');
                        const duration = `${dateStartTimeAMPM} - ${dateEndTimeAMPM}`;

                        let isBetween = false;
                        if(sessionType == 'onGoing')
                        {
                            isBetween = moment(dateEndTime).isAfter(date);
                        }
                        else if(sessionType == 'completed')
                        {
                            isBetween = moment(dateEndTime).isBefore(date);
                        }

                        object = Object.assign(batchItem._doc, {
                            date: dateStartTime,
                            duration: duration,
                            isBetween: isBetween
                        });
                        batchIterator.push(object)

                    }
                })
                let isPending = batchIterator && batchIterator.length && batchIterator.filter(batchItem => batchItem.isBetween);
                if(sessionType == 'onGoing' && isPending.length > 0)
                {
                    batch.iterator = batchIterator
                }
                isPending = batchIterator && batchIterator.length && batchIterator.filter(batchItem => !batchItem.isBetween);
                if(sessionType == 'completed' && isPending.length == 0)
                {
                    batch.iterator = batchIterator
                }
            })
        });

        //Remove Batches having empty iterators
        result && result.length && result.map(session => {
            session.batches = session.batches.filter(batch => {
                if (batch.iterator.length > 0)
                    return true
            })
        });

        //Remove Sessions having empty Batches
        result = result && result.length && result.filter(session => {
            if (session.batches.length > 0) {
                console.log('return true');
                return true
            } else {
                console.log('return false');
                return false
            }
        });

        if (userBookedSession) {
            res.status(200).send({success: true, sessionType:sessionType, result});
        } else {
            res.status(400).send({success: false});
        }
    } catch (e) {
        console.log("error--->", e);
        res.status(500).send({success: false, e});
    }
};

exports.getAllBatchesList = async (req, res) =>{
    let {liveSessionId, location, date} = req.body;
    date = moment(date).format('MMM DD YYYY h:mm a');
    try {
        let instructorIds = [];
        //Find session batches Data
        let result = await LiveSession.find({_id: liveSessionId}).lean();
        let batchIds = [];
        result.map(session => {
            session.batches.map(batch => {
                batchIds.push(batch._id);
                batch.iterator = []
            })
        });
        // Find Iterator Data
        let iteratorsList = await Iterator.find({"batchId": {"$in": batchIds}});
        result.map(session => {
            session.batches.map(batch => {
                let batchIterator = [];
                iteratorsList.map(iteratorItem => {
                    if (iteratorItem.batchId.toString() == batch._id.toString()) {
                        batchIterator.push(iteratorItem)
                    }
                });
                batch.iterator = batchIterator;
                instructorIds.push(batch.instructorId)
            })
        });
        // Find Instructor bio and Name
        instructorIds = [...new Set(instructorIds)];
        let instructorsList = await Instructor.find({"_id": {"$in": instructorIds}});
        // Add Name and bio in Iterators
        result.map(session => {
            let batchIterator = [];
            session.batches.map(batch => {
                batchIterator.push({
                    name:instructorsList.filter(instructorId => batch.instructorId == instructorId._id)[0].name,
                    bio: instructorsList.filter(instructorId => batch.instructorId == instructorId._id)[0].bio,
                    ...batch,
                })
            });
            session.batches = batchIterator
        });
        // Convert Instructor’s timezone to client timezone && short according to iterators time
        result.map(session => {
            session.batches.map(batch => {
                let batchIterator = [];
                batch.iterator.map(iterator => {
                    const filterTimezone = timeZoneList && timeZoneList.filter(ele => ele.name === iterator._doc.timeZone);
                    let iteratorDate = moment(iterator._doc.date).format('MMM DD YYYY h:mm a');
                    iteratorDate = moment(iteratorDate).tz(filterTimezone && filterTimezone[0] && filterTimezone[0].value).format('MMM DD YYYY h:mm a');
                    let dateStartTime = moment(iteratorDate).format('MMM DD YYYY');
                    let dateEndTime = moment(iteratorDate).format('MMM DD YYYY');
                    const startTime = iterator._doc.duration.split('-')[0];
                    const endTime = iterator._doc.duration.split('-')[1];
                    dateStartTime = moment(dateStartTime + ' ' + startTime).format('MMM DD YYYY h:mm a');
                    dateEndTime = moment(dateEndTime + ' ' + endTime).format('MMM DD YYYY h:mm a');
                    dateStartTime = moment.tz(dateStartTime, 'MMM DD YYYY h:mm a', filterTimezone && filterTimezone[0] && filterTimezone[0].value).tz(location).format('MMM DD YYYY h:mm a');
                    dateEndTime = moment.tz(dateEndTime, 'MMM DD YYYY h:mm a', filterTimezone && filterTimezone[0] && filterTimezone[0].value).tz(location).format('MMM DD YYYY h:mm a');
                    const dateStartTimeAMPM = moment(dateStartTime).format('h:mm a');
                    const dateEndTimeAMPM = moment(dateEndTime).format('h:mm a');
                    const duration = `${dateStartTimeAMPM} - ${dateEndTimeAMPM}`;
                    console.log("date---->>", dateStartTime, duration, moment(dateStartTime).isBefore(date));
                    // if (dateStartTime && moment(dateStartTime).isBefore(date)){
                    //   return true;
                    // }
                    batchIterator.push({
                        ...iterator._doc,
                        date: dateStartTime,
                        duration: iterator._doc.duration,
                        isCompleted: moment(dateStartTime).isBefore(date)
                    })
                });
                const isCompleted = batchIterator.filter((item) => item.isCompleted==false);
                batchIterator.sort((a, b)=> moment(a.date).isAfter(b.date));
                const data1 = batchIterator.filter(item =>
                    moment(item.date, 'MMM DD YYYY h:mm a').isAfter(date)
                );
                const data2 = batchIterator.filter(item =>
                    moment(item.date, 'MMM DD YYYY h:mm a').isSameOrBefore(date)
                );
                const data = data1.concat(data2);

                // batchIterator.sort((x, y) => Number(x.isCompleted) - Number(y.isCompleted));
                batch.isCompleted = isCompleted.length>0?false:true
                batch.iterator = data
            });
            session.batches.sort((a, b)=> {
                if(a.iterator.length>0 && b.iterator.length>0 && !b.iterator.isCompleted && !a.iterator.isCompleted)
                    return moment(a.iterator[0].date).isAfter(b.iterator[0].date);
                else
                    return false
            });
            session.batches.sort((x, y) => {
                return Number(x.isCompleted) - Number(y.isCompleted)
            });
        });
        if (result.length>0) {
            res.status(200).send({success: true,result});
        } else {
            res.status(400).send({success: false});
        }
    } catch (e) {
        console.log("error--->", e);
        res.status(500).send({success: false, e});
    }
};

exports.purchaseBatchesSeats = async (req, res) =>{
    const { id } = req.params;
    let sessionId = ObjectId(id);
    console.log("sessionId", sessionId)
    try {
        let updatedValue = {};
        const bookSession = await BookBatch.find();
        var count = {};
        bookSession && bookSession.length && bookSession.forEach(function(i) { count[i.BatchId] = (count[i.BatchId]||0) + 1});
        const liveSessionData = await liveSession.findIdWithSession(id);
        if (liveSessionData) {
            liveSessionData && liveSessionData.batches && liveSessionData.batches.length && liveSessionData.batches.map( item =>{
                if (count && Object.keys(count).includes(ObjectId(item._id).toString())){
                    count && Object.keys(count).forEach(async countVal => {
                        await LiveSession.updateOne({_id: sessionId, "batches._id": item._id},
                            {$set:{"batches.$.capacityOfSeats": (item.capacityOfSeats-count[countVal]) >=1 ? item.capacityOfSeats-count[countVal] : 0,
                                    "batches.$.batchIsFull": ((item.capacityOfSeats-count[countVal]) <=0) ? true : false
                                }}).then(response =>{
                            console.log("updatedValue----->>>", response);
                            updatedValue = response;
                        }).catch(e =>{
                            console.log("error", e)
                        });
                    })
                }
            })
        }
        res.status(200).send({success: true, updatedValue})
    } catch (e) {
        console.log(e)
    }
};

exports.activeSession = async (req, res) => {
    const id = req.params.id;
    await liveSession.active(id).then(response=>{
        if (response) {
            res.status(200).send({msg: "SuccessFully Activate Task."});
        } else {
            res.status(400).send({msg: "something went wrong."});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error."});
        console.log("err---->", err);
    })
}

exports.deActiveSession = async (req, res) => {
    const id = req.params.id;
    await liveSession.delete(id).then(response=>{
        if (response) {
            res.status(200).send({msg: "SuccessFully DeActivate Task."});
        } else {
            res.status(400).send({msg: "something went wrong."});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error."});
        console.log("err---->", err);
    })
}
