import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const uploadPost = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const post = await Post.create({
    title,
    description,
    video: video.url,
    thumbnail: thumbnail.url,
    owner: req.user._id,
  });

  const createdPost = await Post.findById(post._id);

  if (!createdPost) {
    throw new ApiError(500, "Something went wrong while posting");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdPost, "Posted Successfully"));
});

const fetchPosts = asyncHandler(async(req,res)=>{
    const posts = await Post.find();
    return res
    .status(201)
    .json(new ApiResponse(200, posts, "All Posts"));
})

const fetchUserPosts = asyncHandler(async(req,res)=>{
    const posts = await Post.find({owner:req.user._id});
    return res
    .status(201)
    .json(new ApiResponse(200, posts, "All Posts"));
})

export { uploadPost, fetchPosts, fetchUserPosts };
