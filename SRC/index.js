// external export
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dotenvFilePath = path.join(__dirname, '../.env');


// internal export
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/mongoDB.js";

// initialization
dotenv.config({ path: dotenvFilePath});

// port
const { PORT } = process.env;

// call database and create express server
connectDB().then(() => {
    try {
        app.listen(PORT || 8000, () => {
            console.log(
                `server running at http://localhost:${PORT ? PORT : 8000}`
            );
        });
    } catch (error) {
        console.log(`server cannot run \n error is: ${error}`);
    }
});
