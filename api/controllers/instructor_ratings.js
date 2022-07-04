const InstructorRating = require("../models/instructor_ratings");

const Reviews = require("../models/livesession_review");
const rating = require('../repository/instructor_ratings');

exports.addSessionRate = async (req, res) =>{
    const data = await InstructorRating.findOne({$and: [{livesession : req.body.livesession, user: req.body.user }]});
    if(data){
        const updateRating =await InstructorRating.updateOne({_id : data._id},{$set : {rating_date : new Date(),rating_stars : req.body.rating_stars}});
        res.status(200).send({msg: "success", updateRating});
    }
    else {
        const rateObj = {
            rating_date : new Date(),
            rating_user : req.body.rating_user,
            rating_stars : req.body.rating_stars,
            user : req.body.user,
            livesession : req.body.livesession
        }
        await rating.save(rateObj).then(response=>{
            res.status(200).send({msg: "success", response});
        }).catch(err =>{
            res.status(404).send({msg: "error"});
        })
    }
};

exports.getRatings = async (req, res) =>{
    const id = req.params.sessionId;
    const total_rating  = await InstructorRating.find({livesession : req.params.sessionId});
    const all_reviews = await Reviews.find({livesession : req.params.sessionId});
    await rating.avgRating(id).then(response=>{
        console.log("res.res", response);
        res.status(200).send({msg: "success", response, total_rating : total_rating.length, all_reviews});
    }).catch(err =>{
        console.log("error----->>", err);
        res.status(404).send({msg: "error"});
    })
};

