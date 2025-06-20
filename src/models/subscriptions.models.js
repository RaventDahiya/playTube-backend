import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      //one who subscribes to the channel
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      // the channel to which the user subscribes
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
