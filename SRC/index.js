// external export
import dotenv from "dotenv";
import { app } from "./app.js";

// internal export
import connectDB from "./db/mongoDB.js";
const { PORT } = process.env;

// initilation
dotenv.config();

// call database and creat express server
connectDB().then(() => {
    try {
        app.listen(PORT || 8000, () => {
            console.log(
                `⚙️server running at http://localhost:${PORT ? PORT : 8000}`
            );
        });
    } catch (error) {
        console.log(`server cannot run \n error is: ${error}`);
    }
});
