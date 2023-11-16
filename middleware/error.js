const ErrorHandler = require('../utils/errorhandler');

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || " Internal server error";

    // wrong mongodb id error
    if(err.name === "castError"){
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message,400);
    }

    // Mongoose duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Objects.keys(err.keyValue)} Entered`;
    }

    // Wrong JWT error
    if(err.name === "jsonwebTokenError"){
        const message = `Json web token is invalid, try again`;
        err = new ErrorHandler(message,400);
    }

    //Jwt Expire error
    if(err.name === "tokenExpiredError"){
        const message = `Json web Token is expired, try again`;
        err = new ErrorHandler(message,400);
    }

    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}