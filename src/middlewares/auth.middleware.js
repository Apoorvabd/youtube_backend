import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        console.log("TOKEN RECEIVED:", token);
        // console.log(token);
        if (!token) {
            if (req.isOptionalAuth) {
                return next();
            }
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            if (req.isOptionalAuth) {
                return next();
            }
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        if (req.isOptionalAuth) {
            return next();
        }
        if (error instanceof ApiError) {
            throw error;
        }

        const isJwtError = ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error?.name);
        if (isJwtError) {
            throw new ApiError(401, "Invalid access token");
        }

        const errorText = `${error?.name || ""} ${error?.message || ""}`;
        const isDatabaseConnectivityError = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|MongoNetworkError|MongoServerSelectionError/i.test(errorText);

        if (isDatabaseConnectivityError) {
            throw new ApiError(503, "Database connection issue. Please try again shortly.");
        }

        throw new ApiError(500, error?.message || "Authentication middleware failed");
    }
    
})