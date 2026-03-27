import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"

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
    const uId = req.user._id;
    if (!isValidObjectId(uId)) {
        throw new ApiError(400, "invalid user id")
    }

    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;
    
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;
    const sortOrder = sortType === "asc" ? 1 : -1;

    const pipeline = [
        {
            $match: { owner: new mongoose.Types.ObjectId(uId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                duration: 1,
                thumbnail: 1,
                views: 1,
                createdAt: 1,
                isPublished: 1,
                "owner.username": 1,
                "owner.fullName": 1,
                "owner.avatar": 1,
                "owner._id": 1
            }
        },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limitNumber }
    ];

    const videos = await Video.aggregate(pipeline);

    res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
}