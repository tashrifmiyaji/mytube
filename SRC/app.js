// external inputs
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// internal inputs
const { CORS_ORIGIN } = process.env;

// initilation
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

// export
export { app };
