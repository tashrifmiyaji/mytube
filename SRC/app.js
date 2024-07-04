// external inputs
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// internal inputs
const { CORS_ORIGIN } = process.env;

// initialization
const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
    cors({
        origin: CORS_ORIGIN,
        credentials: true,
    })
);

// Routes inputs
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js"

// Routes declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

// export
export { app };
