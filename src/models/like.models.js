import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: false, // Optional, as likes can be on videos or comments
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
      required: false, // Optional, as likes can be on videos or tweets
    },
  },
  { timestamps: true }
);
likeSchema.plugin(mongooseAggregatePaginate);
export const Like = mongoose.model("Like", likeSchema);
