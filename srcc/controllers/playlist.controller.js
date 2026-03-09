import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// ✅ CREATE PLAYLIST
const createPlaylist = asyncHandler(async (req, res) => {

    const { name, description } = req.body
    

    if (!name) {
        throw new ApiError(400, "Give name to playlist")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist created")
    )
})


// ✅ GET USER PLAYLISTS
const getUserPlaylists = asyncHandler(async (req, res) => {

    const { userId } = req.params
    console.log(userId)

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const list = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    res.status(200).json(
        new ApiResponse(200, list, "All playlists are here")
    )
})


// ✅ GET PLAYLIST BY ID
const getPlaylistById = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Found your playlist")
    )
})


// ✅ ADD VIDEO TO PLAYLIST
const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid id found")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // Authorization check
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized user")
    }

    // Prevent duplicate video
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in playlist")
    }

    playlist.videos.push(videoId)
    await playlist.save()

    res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist")
    )
})


// ✅ REMOVE VIDEO FROM PLAYLIST
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid id found")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized user")
    }

    playlist.videos = playlist.videos.filter(
        (id) => id.toString() !== videoId
    )

    await playlist.save()

    res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist")
    )
})


// ✅ DELETE PLAYLIST
const deletePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Wrong id mentioned")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized user")
    }

    await Playlist.findByIdAndDelete(playlistId)

    res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted")
    )
})


// ✅ UPDATE PLAYLIST
const updatePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Wrong id")
    }

    if (!name) {
        throw new ApiError(400, "Please provide playlist name")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized")
    }

    playlist.name = name
    playlist.description = description

    await playlist.save()

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
  