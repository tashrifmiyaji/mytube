// internal inputs
import { asyncHandlerWP } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandlerWP(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.split(" ")[1];

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        
        console.log(process.env.ACCESS_TOKEN_SECRET);
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error || "Invalid access token");
    }
});
