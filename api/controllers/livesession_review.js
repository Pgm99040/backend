const Review = require("../models/livesession_review");


exports.addReview = async (req,res)=> {
    try{
        const data1 = await Review.findOne({$and: [{livesession : req.body.livesession, email: req.body.email}]});
        console.log("data1----->>>", data1)
        if(data1){
            const updateRating =await Review.updateOne({_id: data1._id},{$set : {date : new Date(), title : req.body.title, description : req.body.description, stars : req.body.stars}});
            console.log("updateRating",updateRating)
            res.status(200).send({msg: "success", updateRating});
        }else{
            const data = {
                ...req.body,
                date : new Date()
            }
            var user = new Review(data)
            await user.save(data).then(response=>{
                res.status(200).send({msg: "success", response});
            }).catch(err =>{
                res.status(404).send({msg: "error"});
            })
        }
    }catch(e){
        res.status(404).send({msg : "error"})
    }
}