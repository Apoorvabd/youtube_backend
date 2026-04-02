import { Router } from 'express';
import {
    deleteVideo,
  getfilteredvdo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/upload.middleware.js"

const router = Router();
console.log("🔥 VIDEO ROUTER LOADED");

// ── Public routes (no auth needed) ──────────────────────────────────────────
router.route("/").get(getAllVideos);
router.route("/search").get(getfilteredvdo);
router.route("/:videoId").get(
    (req, _, next) => {
        req.isOptionalAuth = true;
        next();
    },
    verifyJWT,
    getVideoById
);

// ── Protected routes (JWT required) ─────────────────────────────────────────
router.post(
  "/",
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

router.route("/:videoId")
  .delete(verifyJWT, deleteVideo)
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router