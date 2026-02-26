import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { getUserChannelSubscribers } from "./subscription.controller.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // compute basic dashboard statistics for the authenticated channel owner
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    // total number of videos uploaded by this user
    const totalVideos = await Video.countDocuments({ owner: userId });

    // total views across all of the user's videos
    const viewsResult = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, views: { $sum: "$views" } } }
    ]);
    const totalViews = viewsResult[0]?.views || 0;

    // total likes on the user's videos
    const likesResult = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoInfo"
            }
        },
        { $unwind: "$videoInfo" },
        { $match: { "videoInfo.owner": new mongoose.Types.ObjectId(userId) } },
        { $count: "likes" }
    ]);
    const totalLikes = likesResult[0]?.likes || 0;

    // total subscribers of this channel
    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalViews,
            totalLikes,
            totalSubscribers,
        },
        "channel statistics retrieved successfully")
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const uId=req.user._id;
    if(!isValidObjectId(uId)){
        throw new ApiError(400,"wrong id")
    }
    const list=await Video.aggregate([
        {
            $match:{owner:uId}
        },
        {
            $project:{
                title:1,
                description:1,
                videoFile:1,
                duration:1,
                thumbnail:1
            }
        }
    ])
    res.status(200).json(new ApiResponse(200,list,"here is list of all videos posted by you"))
})

export {
    getChannelStats, 
    getChannelVideos
    }