// internal input
import { Subscription } from "../models/subscription.model.js";
import { Notification } from "../models/notification.model.js";


const notifySubscribers = async (channelId, videoDetails) => {
    try {
        // Fetch all subscriber of the channel
        const subscription = await Subscription.find({
            channel: channelId,
        }).populate("subscriber");

        // Prepare notifications for each subscriber
        const notification = subscription.map((sub) => ({
            subscriber: sub.subscriber._id,
            channel: sub.channel,
            videoId: videoDetails.videoId,
            videoTitle: videoDetails.title,
            videoUrl: videoDetails.url,
            message: videoDetails.message,
        }));

        // Save notifications to the database
        await Notification.insertMany(notification);
    } catch (error) {
        console.error("Error notifying subscribers!:", error);
    }
};

const updateNotification = async (videoDetails) => {

    try {
        const notification = await Notification.findOne({
            videoId: videoDetails.videoId,
        });
    
        // for update title
        if (videoDetails.title) {
            notification.videoTitle = videoDetails.title;
            await notification.save({ validateBeforeSave: false });
        }
    
        // updated notify message and read mark
    
        await Notification.findByIdAndUpdate(notification._id, {
            $set: {
                message: videoDetails.message,
                isRead: false,
            },
        });
    } catch (error) {
        console.error("Something was wrong while updating the notification!:", error);
    }
};

const deleteNotification = async (videoId) => {
    const notification = await Notification.findOne({ videoId });
    await Notification.findByIdAndDelete(notification._id);
};

export { notifySubscribers, updateNotification, deleteNotification };
