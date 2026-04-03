import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

/* ================= VIDEO LIKE ================= */

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const like = await Like.findOneAndDelete({
        video: videoId,
        likedBy: req.user._id
    });

    if (like) {
        return res.status(200).json(
            new ApiResponse(200, null, "Video like removed")
        );
    }

    await Like.create({
        video: videoId,
        likedBy: req.user._id
    });

    res.status(200).json(
        new ApiResponse(200, req.user.fullName, "Video liked")
    );
});

/* ================= COMMENT LIKE ================= */

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const like = await Like.findOneAndDelete({
        comment: commentId,
        likedBy: req.user._id
    });

    if (like) {
        return res.status(200).json(
            new ApiResponse(200, null, "Comment like removed")
        );
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user._id
    });

    res.status(200).json(
        new ApiResponse(200, null, "Comment liked")
    );
});

/* ================= TWEET LIKE ================= */

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const like = await Like.findOneAndDelete({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (like) {
        return res.status(200).json(
            new ApiResponse(200, null, "Tweet like removed")
        );
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    });

    res.status(200).json(
        new ApiResponse(200, null, "Tweet liked")
    );
});

/* ================= GET LIKED VIDEOS ================= */

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(401, "Unauthorized");
    }

    const result = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        { $unwind: "$video" },
        {
            $lookup: {
                from: "users",
                localField: "video.owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },
        {
            $project: {
                _id: "$video._id",
                thumbnail: "$video.thumbnail",
                videoFile: "$video.videoFile",
                title: "$video.title",
                description: "$video.description",
                duration: "$video.duration",
                views: "$video.views",
                isPublished: "$video.isPublished",
                createdAt: "$video.createdAt",
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    fullName: "$owner.fullName",
                    avatar: "$owner.avatar"
                }
            }
        }
    ]);

    res.status(200).json(
        new ApiResponse(200, result, "Liked videos fetched successfully")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
