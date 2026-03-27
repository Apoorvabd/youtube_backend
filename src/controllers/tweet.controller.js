import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required")
    }
    const newtweet = await Tweet.create({
        content: content,
        owner: req.user?._id
    })
    res.status(200).json(new ApiResponse(200, newtweet, "New tweet published"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const alltweet = await Tweet.find({
        owner: req.user._id
    })
    res.status(200).json(new ApiResponse(200, alltweet, "User tweets fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const tweetid = req.params.tweetId

    if (!isValidObjectId(tweetid)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetid)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to update this tweet")
    }

    const { content } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Update content is required")
    }

    const updatedtweet = await Tweet.findByIdAndUpdate(
        tweetid,
        { content: content },
        { new: true }
    )
    
    res.status(200).json(new ApiResponse(200, updatedtweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetid = req.params.tweetId
    
    if (!isValidObjectId(tweetid)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetid)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this tweet")
    }

    const deltweet = await Tweet.findByIdAndDelete(tweetid)
    res.status(200).json(new ApiResponse(200, deltweet, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
