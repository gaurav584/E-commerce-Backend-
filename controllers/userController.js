const User = require('../models/userModels');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhandler');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// registring a user
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{

    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample id",
            url:"profilepicUrl"
        }
    })

    sendToken(user,201,res);
})

// Login User
exports.loginUser = catchAsyncErrors(async (req,res,next)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email & password",400));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password"));
    }

    const isPasswordMatched = user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password"));
    }

    sendToken(user,200,res);
})

// logout-user
exports.logout = catchAsyncErrors(async(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httponly:true
    });

    res.status(200).json({
        success:true,
        message:"Logout out"
    })
})

// forgot-password
exports.forgotPassword = catchAsyncErrors(async (req,res,next)=>{

    const {email} = req.body;

    const user = await User.findOne({email});

    if(user){
        return next(new ErrorHandler("user not found",404));
    }

    user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message =`your password reset token is :-\n\n ${resetPasswordUrl} \n\n if you have not requested the email
    then, please ignore it`;

    try{

        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message
        });

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} succesfully`,
        })

    }catch(error){
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message,500));
    }
})

// Reset-Password
exports.resetPassword = catchAsyncErrors(async (req,res,next)=>{

    //creating token hash
    const resetPasswordToken = crypto
         .createHash("sha256")
         .update(req.params.token)
         .digiest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    });

    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired",400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired"));
    }

    user.password = req.body.password;

    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    sendToken(user,200,res);
})

// get user details
exports.getUserDetails = catchAsyncErrors(async (req,res,next)=>{

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    })
})

exports.updatePassword = catchAsyncErrors(async (req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("old password is incorrect",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match",400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res);
})

// update-user profile
exports.updateProfile = catchAsyncErrors( async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email
    }

    // we will add cloudniary later

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        userFindAndModify:false
    })

    res.status(200).json({
        success:true
    })
})

// get all users -(admin)
exports.getAllUser = catchAsyncErrors(async (req,res,next)=>{
    const users = await User.find();

    res.status(200).json({
        success:true
    })
})

// get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req,res,next)=>{

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler("User"))
    }

    res.status(200).json({
        success:true,
        user
    })
})

// update User role -(admin)
exports.updateUserRole = catchAsyncErrors(async (req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    };

    // we will add cloudmiary later

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        userFindAndModify:false
    })

    res.status(200).json({
        success:true,
    })
})

// delete User -(admin)
exports.deleteUser = catchAsyncErrors(async (req,res,next)=>{

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exists with id:${req.params.id}`))
    }

    await user.remove();

    res.status(200).json({
        success:true
    })
})
