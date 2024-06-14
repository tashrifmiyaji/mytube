import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

// export
export { Subscription };
