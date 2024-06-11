import mongoose, { Schema } from "mongoose";

const subscripitionSchema = new Schema(
    {
        Subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps }
);

const Subscripition = mongoose.model("Subscripition", subscripitionSchema);

// export
export { Subscripition };
