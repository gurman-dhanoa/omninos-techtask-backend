import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { fetchPosts, uploadPost, fetchUserPosts } from "../controllers/post.controller.js";

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
router.route("/user").get(verifyJWT,fetchUserPosts)

export default router;
