
const StoreData = require("../models/StoreData");

exports.createStoreData = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        await StoreData.create(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.getAllStoreData = async (req, res) => {
    try {
        const data = await StoreData.find({})
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};