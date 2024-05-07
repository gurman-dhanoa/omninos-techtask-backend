import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema(
    {
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post"
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        likeStatus:{
            type: Boolean,
            required: true
        }
    }, 
    {
        timestamps: true
    }
)

export const Like = mongoose.model("Like", likeSchema)