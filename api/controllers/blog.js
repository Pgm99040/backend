const Blog = require('../models/blog');
const blog = require("../repository/blog");

exports.createBlog = async (req, res) => {
    try {
        const obj = {
            ...req.body
        };
        await blog.save(obj).then(response => {
            res.status(200).send({msg: "success", response});
        }).catch(err => {
            console.log("error----->>", err);
            res.status(404).send({msg: "error"});
        })
    } catch (e) {
        res.status(400).send("fail")
    }
};

exports.getBlog = async (req, res) => {
    try {
        const data = await Blog.find({isActive : true});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getAllBlog = async (req, res) => {
    try {
        const data = await Blog.find({});
        res.send({msg: "done", data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.updateBlog = async (req, res) => {
    try {
        await Blog.findByIdAndUpdate({_id: req.body._id}, req.body);
        res.send({msg: "done", success: true})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.getBlogDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Blog.findOne({_id: id, isActive : true});
        res.send({msg: "done", success: true, data: data})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.updateCommentForBlog = async (req, res) => {
    try {
        const id = req.params.id;
        const update = await Blog.findByIdAndUpdate({_id: id}, {$push: {comments: req.body}});
        res.send({msg: "done", success: true, data: update})
    } catch (e) {
        res.status(400).send({msg: "fail"})
    }
};

exports.activeBlog = async (req, res) => {
    const id = req.params.id;
    await blog.active(id).then(response=>{
        if (response) {
            res.status(200).send({msg: "SuccessFully Activate Blog."});
        } else {
            res.status(400).send({msg: "something went wrong."});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error."});
        console.log("err---->", err);
    })
}

exports.deActiveBlog = async (req, res) => {
    const id = req.params.id;
    await blog.delete(id).then(response=>{
        if (response) {
            res.status(200).send({msg: "SuccessFully DeActivate Blog."});
        } else {
            res.status(400).send({msg: "something went wrong."});
        }
    }).catch(err =>{
        res.status(500).send({msg: "internal server error."});
        console.log("err---->", err);
    })
}
