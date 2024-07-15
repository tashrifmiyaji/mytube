// external inputs
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

tweetSchema.plugin(mongooseAggregatePaginate);
const Tweet = mongoose.model("Tweet", tweetSchema);

// export
export { Tweet };
