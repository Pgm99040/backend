const Feed = require("../models/feed");
const feed = require("../repository/feed");

exports.createFeed = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        console.log("obj",obj)
        await feed.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.updateFeed = async (req, res) => {
    try {
        await Feed.findByIdAndUpdate({_id : req.body._id}, req.body);
        res.send({msg: "done", success : true})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getFeed = async (req, res) => {
    try {
        const data = await Feed.find({isActive : true});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getAllFeed = async (req, res) => {
    try {
        const data = await Feed.find({});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.activeFeed = async (req, res) => {
    const id = req.params.id;
    await feed.active(id).then(response=>{
        if (response) {
            res.status(200).send({msg: "SuccessFully Activate Feed."});
        } else {
            res.status(400).send({msg: "something went wrong."});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error."});
        console.log("err---->", err);
    })
}

exports.deActiveFeed = async (req, res) => {
    const id = req.params.id;
    await feed.delete(id).then(response=>{
        if (response) {
            res.status(200).send({msg: "SuccessFully DeActivate Feed."});
        } else {
            res.status(400).send({msg: "something went wrong."});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error."});
        console.log("err---->", err);
    })
}
