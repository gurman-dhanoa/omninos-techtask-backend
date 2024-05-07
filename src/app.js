import express from "express"
import cors from "cors"
import {Errorhandler} from "./middlewares/ErrorHandler.middleware.js"
import cookieParser from "cookie-parser"

const app = express()

const allowedOrigins = process.env.ALLOWED_ORIGINS;
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },credentials: true,
}));

app.get("/", function (req, res) {
    res.status(200).json({
        success: true,
        message: "Backend is working successfully!!!"
      });
});

app.use(express.json({limit: "5mb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("./public"))
app.use(cookieParser())

import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'

app.use("/api/v1/users", userRouter)
app.use("/api/v1/post", postRouter)

app.use(Errorhandler)

export {app}