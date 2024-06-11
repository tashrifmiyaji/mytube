// internal inpurt
import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // save Refresh token in database
        user.refreshToken = refreshToken;
        await user.save({ validitBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "something went wrong while genarate token!");
    }
};

// export
export { generateAccessAndRefreshToken };
