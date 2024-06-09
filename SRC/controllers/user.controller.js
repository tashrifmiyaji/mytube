// internal inputs
import { asyncHandlerWP } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.modle.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
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
        coverImage: coverImage?.url || null
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

export { registerUser };
