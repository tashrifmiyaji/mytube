// internal inputs
import { asyncHandlerWP } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/tokenGenarate.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandlerWP(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: Username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // get user details from frontend
    const { fullName, username, email, password } = req.body;

    // validation - not empty
    if (
        [fullName, username, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "all field is required!");
    }

    // check if user already exists: Username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "already you have an account!");
    }

    // check for images, check for avatar
    //! multer amaderke tar poroborti middleware gulote req.files er access dey
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required!");
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(500, "avatar uploading problem!");
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        username,
        email,
        password,
        avatar: avatar?.url,
        coverImage: coverImage?.url || null,
    });

    // remove password and refresh token field from response
    const createddUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // check for user creation
    if (!createddUser) {
        throw new ApiError(
            500,
            "something went wrong while register the User!"
        );
    }

    // return res
    res.status(201).json(
        new ApiResponse(200, createddUser, "user registed successfully")
    );
});

const loginUser = asyncHandlerWP(async (req, res) => {
    // data form req.body
    // username or email from body
    // find user
    // check password
    // genarate access & refresh token
    // send token with cookes

    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required!");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "user does not exist!");
    }

    const isPasswordValid = user.isCorrectPassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "invalid user credentials!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const sendAbleData = {
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        watchHistory: user.watchHistory,
    };

    const cookieOption = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(
            new ApiResponse(
                200,
                {
                    user: sendAbleData,
                    accessToken,
                    refreshToken,
                },
                "user logged in successfully"
            )
        );
});

const logoutUser = asyncHandlerWP(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const cookieOption = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandlerWP(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request!");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used!");
        }

        const cookieOptions = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } = generateAccessAndRefreshToken(
            user._id
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error, "invalid refresh token!");
    }
});

const changeCurrentPassword = asyncHandlerWP(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isCorrectPassword = user.isCorrectPassword(oldPassword);

    if (!isCorrectPassword) {
        throw new ApiError(400, "invalid password!");
    }

    user.password = newPassword;
    await user.save({ validitBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandlerWP(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "current user fatched successfully");
});

const updateAccountDetails = asyncHandlerWP(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "min 1 field is required!");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName: fullName ? fullName : req.user.fullName,
                email: email ? email : req.user.email,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});
// export
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails
};
