import {ApiError} from "./../utils/ApiError.js"

const Errorhandler = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    if(err.name === "CastError"){
        const message = `Resourse not found. Invalid : ${err.path}`;
        err = new ApiError(message,400);
    }

    res.status(err.statusCode).json({
        "success":"false",
        "message":err.message,
    })
}

export {Errorhandler}