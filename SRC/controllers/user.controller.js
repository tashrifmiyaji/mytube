// internal inputs
import { asyncHandlerWP } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/tokenGenerate.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
        avatar: { public_id: avatar?.public_id, url: avatar?.url },
        coverImage: {
            public_id: coverImage?.public_id || null,
            url: coverImage?.url || null,
        },
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );
    // Todo if be problem when save data in database then delete image from cloudinary

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select("-password");

    // check for user creation
    if (!createdUser) {
        throw new ApiError(
            500,
            "something went wrong while register the User!"
        );
    }

    // cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    // return res
    res.status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: createdUser,
                    accessToken,
                },
                "user registered successfully"
            )
        );
});

const loginUser = asyncHandlerWP(async (req, res) => {
    // data form req.body
    // username or email from body
    // find user
    // check password
    // generate access & refresh token
    // send token with cookies

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

    const isPasswordValid = await user.isCorrectPassword(password);

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
            $unset: {
                refreshToken: 1, // this removes the field from document;
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
            process.env.REFRESH_TOKEN_SECRET
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

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error, "invalid refresh token!");
    }
});

const changeCurrentPassword = asyncHandlerWP(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user?._id);

        const isCorrectPassword = user.isCorrectPassword(oldPassword);

        if (!isCorrectPassword) {
            throw new ApiError(400, "invalid password!");
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "password changed successfully"));
    } catch (error) {
        throw new ApiError(401, "unauthorized request!");
    }
});


const updateAccountDetails = asyncHandlerWP(async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!(fullName || email)) {
        throw new ApiError(400, "min 1 field is required!");
    }

    const isCorrectPassword = await req.user._id.isCorrectPassword(password);
    console.log(isCorrectPassword);

    if (!isCorrectPassword) {
        throw new ApiError(401, "invalid password");
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

const updateUserAvatar = asyncHandlerWP(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing!");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url && !avatar.public_id) {
        throw new ApiError(500, "avatar updating problem!");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: {
                    public_id: avatar.public_id,
                    url: avatar.url,
                },
            },
        },
        { new: true }
    ).select("-password");

    // delete old avatar after uploading new avatar on cloudinary
    const oldAvatarPublic_id = req.user.avatar.public_id;
    deleteFromCloudinary(oldAvatarPublic_id);
    return res
        .status(200)
        .json(new ApiResponse(200, user, "avatar updated successfully"));
});

const uploadOrUpdateCoverImage = asyncHandlerWP(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover image file is missing!");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url && !coverImage.public_id) {
        throw new ApiError(500, "cover image updating problem!");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: {
                    public_id: coverImage.public_id,
                    url: coverImage.url
                }
            },
        },
        { new: true }
    ).select("-password");

    // If there is a previous cover image then delete it
    const oldCoverImagePublic_id = req.user.coverImage?.public_id

    if (oldCoverImagePublic_id) {
        deleteFromCloudinary(oldCoverImagePublic_id)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "cover image updated successfully"));
});

const getCurrentUser = asyncHandlerWP(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "current user fetched successfully")
        );
});

const getUserChannelProfile = asyncHandlerWP(async (req, res) => {
    // jodi 5 ta document e "a" namok channel thake tahole "a" er 5 jon subscriber ache, jara sovai "a" ke subscribe korche
    // R jodi 5 ta document e "a" namok subscriber thake tahole "a" nije 5 ta channel ke subscribe korche,

    const { username } = req.params;

    if (!username.trim()) {
        throw new ApiError(400, "username is missing!");
    }
    const channel = await User.aggregate([
        {
            $match: {
                username,
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers",
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "channel dose not exist!");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "user channel fetched successfully"
            )
        );
});

const getWatchHistory = asyncHandlerWP(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                // shorashori mongodb te _id er valu thake objectId('xxxxxxxxxxx') eita
                // mongoose er mondde amader sudu _id er objectId er digit ta lekhle chole she porobortite aslo mongodb er moto kore database save kore
                // aggregation pipelines er shathe mongoose er kono somporko nei tai ekhane shorashori mongodb er moto korei id lekhte hoy
                _id: mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        email: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "watch history fetched successfully"
            )
        );
});

//Todo delete user account

// export
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    uploadOrUpdateCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
