const ExportGuidance = require("../models/exportGuidance");
const exportGuidance = require("../repository/exportGuidance");

exports.createExportGuidance = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        await exportGuidance.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.getExportGuidance = async (req, res) => {
    try {
        const data = await ExportGuidance.find({}).sort ({createdAt : -1})
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getAllExportGuidance = async (req, res) => {
    try {
        const data = await ExportGuidance.find({}).sort ({createdAt : -1});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.updateExportGuidance = async (req, res) => {
    try {
        await ExportGuidance.findByIdAndUpdate({_id : req.body._id}, req.body);
        res.send({msg: "done", success : true})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};
