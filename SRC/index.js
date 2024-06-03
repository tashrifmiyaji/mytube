// external export
import dotenv from "dotenv";


// internal export
import connectDB from "./db/mongoDB.js";


// initilation
dotenv.config()

// call database
connectDB();