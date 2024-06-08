// internal inputs
import { asyncHandlerWP } from "../utils/asyncHandler.js";

const registerUser = asyncHandlerWP(async (req, res) => {
    res.status(201).json({
        message: "ok",
    });
});

export { registerUser };
