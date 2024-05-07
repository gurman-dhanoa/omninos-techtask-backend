import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import stripeModule from "stripe"
import { v4 as uuid } from 'uuid';
const stripe = stripeModule(process.env.STRIPE_SECRET_KEY);

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

const fetchPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate("owner").select("-video");
  return res.status(201).json(new ApiResponse(200, posts, "All Posts"));
});

const fetchUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ owner: req.user._id })
    .populate("owner")
    .select("-video");
  return res.status(201).json(new ApiResponse(200, posts, "All Posts"));
});

const postDetails = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId).populate("owner");
  post.views++;
  await post.save();
  return res.status(201).json(new ApiResponse(200, post, "Post Details"));
});

const likeStatusHandler = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const likeStatus = req.body.likeStatus;
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(500, "Post not found");
  }

  const existingLikeStatus = await Like.findOne({
    post: postId,
    user: req.user._id,
  });
  console.log(existingLikeStatus);
  // new review
  if (!existingLikeStatus) {
    const newLikeStatus = await Like.create({
      user: req.user._id,
      post: postId,
      likeStatus: likeStatus,
    });

    if (!newLikeStatus) {
      throw new ApiError(500, "Something went wrong while posting review");
    }

    if (likeStatus === true) {
      post.likes++;
    } else {
      post.dislikes++;
    }
    await post.save();

    return res
      .status(200)
      .json(new ApiResponse(200, newLikeStatus, "Post like status Updated"));
  }

  // existing review
  const previousStatus = existingLikeStatus.likeStatus;
  if (likeStatus === null) {
    const deleteReview = await Like.deleteOne({
      user: req.user._id,
      post: postId,
    });

    if (!deleteReview) {
      throw new ApiError(500, "Something went wrong while deleting review");
    }
    if (previousStatus === true) {
      post.likes--;
    } else {
      post.dislikes--;
    }
    await post.save();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Post like status Updated"));
  }

  if (likeStatus !== previousStatus) {
    existingLikeStatus.likeStatus = likeStatus;
    await existingLikeStatus.save();

    if (likeStatus === true) {
      post.dislikes--;
      post.likes++;
    } else {
      post.dislikes++;
      post.likes--;
    }
    await post.save();
    return res
      .status(200)
      .json(
        new ApiResponse(200, existingLikeStatus, "Post like status Updated")
      );
  }
});

const likeStatus = asyncHandler(async (req, res) => {
  const {postId} = req.params;
  const existingLikeStatus = await Like.findOne({
    post: postId,
    user: req.user._id,
  });
  if (!existingLikeStatus) {
    return res
    .status(200)
    .json(new ApiResponse(200, {status:null}, "Post like status"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {status:existingLikeStatus.likeStatus}, "Post like status"));
});

const paymentHandler = asyncHandler(async(req,res)=>{
  const {product,token} = req.body;
  const idempontencyKey = uuid();
  return stripe.customers.create({
    email:token.email,
    source:token.id
  }).then(customer => {
    stripe.charges.create({
      amount: product.price * 100,
      currency: 'usd',
      customer: customer.id,
      receipt_email : token.email,
      description:`purchase of ${product.name}`,
    },{idempontencyKey})
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err))
  })
});

export {
  uploadPost,
  fetchPosts,
  fetchUserPosts,
  postDetails,
  likeStatusHandler,
  likeStatus,
  paymentHandler
};
