const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
        maxLength:[30,"Name cannot exceed 30 chracters"],
        minLength:[4,"Name should have more than "]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validate:[validator.isEmail,"please enter a valid email"],
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
        minLength:[8,"Password should be greater than 8 chracters"],
        select:false,
    },
    avatar: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
      role: {
        type: String,
        default: "user",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    
      resetPasswordToken: String,
      resetPasswordExpire: Date,
});

// hash-password
userSchema.pre("save",async function(next){
   
    if(!this.isModified("password")){
        next();
    }

    this.password = await bcrypt.hash(this.password,10);
})

// jwt-Token
userSchema.methods.getJWTToken =  function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}

// compare password
userSchema.methods.comparePassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword,this.password);
}

// generating password reset token
userSchema.methods.getResetPasswordToken = function(){

    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
       .createHash("sha256")
       .update(resetToken)
       .digest("hex");

    this.resetPasswordExpire = Date.now()+15*60*1000;

    return resetToken;
}

module.exports = mongoose.model('User',userSchema);