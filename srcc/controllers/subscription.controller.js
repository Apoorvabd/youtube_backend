import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription: subscribe/unsubscribe
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  // Check if subscription exists
  const existing = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existing) {
    // Unsubscribe
    await existing.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed successfully"));
  } else {
    // Subscribe
    const subscription = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId, 
    });
    return res
      .status(201)
      .json(new ApiResponse(201, subscription, "Subscribed successfully"));
  }
});

// Get subscriber list of a channel

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  const channelObjectId = new mongoose.Types.ObjectId(channelId);

  const list = await Subscription.aggregate([
    { $match: { channel: channelObjectId } },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
      },
    },
    { $unwind: "$subscriberInfo" },
    {
      $project: {
        "subscriberInfo._id": 1,
        "subscriberInfo.name": 1,
        "subscriberInfo.email": 1,
        "subscriberInfo.username": 1, // if schema has
        "subscriberInfo.avatar": 1,   // if schema has
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, list, "Here is the subscriber list"));
});

// Get channels a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const requestedSubscriberId = req.params.subscriberId || req.user?._id;

  if (!requestedSubscriberId || !isValidObjectId(requestedSubscriberId)) {
    throw new ApiError(400, "Invalid subscriberId");
  }

  const subscriberId = new mongoose.Types.ObjectId(requestedSubscriberId);

  const list = await Subscription.aggregate([
    { $match: { subscriber: subscriberId } },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelInfo",
      },
    },
    { $unwind: "$channelInfo" },
    {
      $project: {
        "channelInfo._id": 1,
        "channelInfo.name": 1,
        "channelInfo.email": 1,
        "channelInfo.username": 1,
        "channelInfo.avatar": 1,
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, list, "Here are the subscribed channels"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
