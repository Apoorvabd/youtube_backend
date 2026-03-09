import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

    const videoList = await Like.aggregate([
        { $match: { likedBy: userId, video: { $exists: true } } },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoList"
            }
        },
        { $unwind: "$videoList" },
        {
            $project: {
                _id: 0,
                videoId: "$videoList._id",
                title: "$videoList.title",
                owner: "$videoList.owner",
                thumbnail: "$videoList.thumbnail",
                createdAt: "$videoList.createdAt"
            }
        }
    ]);

    res.status(200).json(
        new ApiResponse(200, videoList, "Here are liked videos")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
