import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    console.log("hey comenst are here");
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(403 ,"not valid video id")
    }
    const skip = (Number(page) - 1) * Number(limit);
    const listofcom = await Comment.aggregate([
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "commenter"
            }
        },
        {
            $unwind: "$commenter"
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "commenter.fullName": 1,
                "commenter._id": 1,
                "commenter.email": 1
            }
        },
        { $skip: skip },
        { $limit: Number(limit) }
    ]);

    res.status(200).json(new ApiResponse(200, listofcom, "here is list of all the comments on this video"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params
    const {content}=req.body
 
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(403,"unable to process ")
    }
    if(!content){
         throw new ApiError(403,"enter all fields ")
    }
    const newcomment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })
    res.status(200).json(new ApiResponse(200,newcomment,"comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {comId}=req.params
    if(!mongoose.Types.ObjectId.isValid(comId)){
        throw new ApiError(403,"unable to process ")
    }
    const comment =await Comment.findById(comId);
    if(comment.owner.toString()!== req.user._id.toString()){
        throw new ApiError(400,"not authorized to update this ")
    }
    const {newcon}=req.body
    const updated =await Comment.findByIdAndUpdate(comId,{content:newcon})
    res.status(200).json(new ApiResponse(200,updated,"update completed"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {comId}=req.params
    if(!mongoose.Types.ObjectId.isValid(comId)){
        throw new ApiError(403,"wrong id mili hai")
    }

    const comment = await Comment.findById(comId)
    if(comment.owner.toString()!== req.user._id.toString()){
        throw new ApiError(400,"not authorized to delete this ")
    }
    const deletecomment = await Comment.findByIdAndDelete(comId)
    res.status(200).json(new ApiResponse(200,deletecomment,"delete completed"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
