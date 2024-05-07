import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { fetchPosts, uploadPost, fetchUserPosts, postDetails, likeStatusHandler, likeStatus } from "../controllers/post.controller.js";

const router = Router();

router.route("/upload-post").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadPost
);
router.route("/").get(fetchPosts)
router.route("/user-posts").get(verifyJWT,fetchUserPosts)
router.route("/details/:postId").get(postDetails)
router.route("/like/:postId").post(verifyJWT,likeStatusHandler)
router.route("/likeStatus/:postId").get(verifyJWT,likeStatus)

export default router;
