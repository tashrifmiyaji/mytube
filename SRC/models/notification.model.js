import mongoose, { Schema } from "mongoose";

// Notification Schema
const notificationSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        videoTitle: {
            type: String,
            required: true,
        },
        videoUrl: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        }, // To track if the user has read the notification
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export { Notification };
