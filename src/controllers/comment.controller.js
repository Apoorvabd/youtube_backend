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
    const { videoId } = req.params
    const { content } = req.body
 
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    if (!content || content.trim() === "") {
         throw new ApiError(400, "Content is required")
    }
    const newcomment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    })
    res.status(200).json(new ApiResponse(200, newcomment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to update this comment")
    }
    const { content } = req.body
    if (!content?.trim()) {
        throw new ApiError(400, "Content is required")
    }
    const updated = await Comment.findByIdAndUpdate(
        commentId,
        { content: content.trim() },
        { new: true }
    )
    res.status(200).json(new ApiResponse(200, updated, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this comment")
    }
    const deletecomment = await Comment.findByIdAndDelete(commentId)
    res.status(200).json(new ApiResponse(200, deletecomment, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
