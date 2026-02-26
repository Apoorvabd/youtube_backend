import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory ,
    generateAccessAndRefereshTokens
    } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";





const router = express.Router();
router.get("/me", verifyJWT, getCurrentUser);

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  registerUser  
);

router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/refreshtoken",generateAccessAndRefereshTokens)
router.post("/changepass",changeCurrentPassword)
router.post("/getuser",getCurrentUser)

export default router;
