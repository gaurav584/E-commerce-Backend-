const Product = require("../models/productModels");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require("../utils/apiFeatures");


// create product
exports.createProduct = catchAsyncErrors(async(req,res,next)=> {
   
    const product = await Product.create(req.body);

    res.status(200).json({
        success:true,
        product
    })
})

// get all products
exports.getAllProducts =catchAsyncErrors(async (req,res,next) => {
     
    const resultPerPage = 5;
    const productCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

    const product = await apiFeature.query;

    res.status(200).json({
        success:true,
        product,
        productCount
    })
})

// update Product --Admin
exports.updateProduct = catchAsyncErrors(async (req,res,next)=>{
    
    let product = await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success:false,
            message:"Product not found"
        })
    }

    console.log('Hello');

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        product
    })
})

// Delete Product
exports.deleteProduct = catchAsyncErrors(async (req,res,next)=>{

    let product = await Product.findById(req.params.id);
    
    if(!product){
        return res.status(500).json({
            success:false,
            message:"Product not found"
        })
    }

    product = await Product.findByIdAndRemove(req.params.id);

    res.status(200).json({
        success:false,
        message:"product Delete Succesfully"
    })

})

// get products details
exports.getProductDetails = catchAsyncErrors(async(req,res,next)=>{

    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("product not found",404));
    }

    res.status(200).json({
        success:true,
        product
    })
})

// create New Review or update the review
exports.createProductReview = catchAsyncErrors(async (req,res,next)=>{

    const {rating,comment,productId} = req.body;

    const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev)=> rev.user.toString()===req.user._id.toString()
    );

    if(isReviewed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString() === req.user._id.toString()){
                rev.rating = rating;
                rev.comment = comment
            }
        })
    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg =0;

    product.rating = 
      product.reviews.forEach((rev)=>{
        avg += rev.rating;
      })/product.reviews.length;

      await product.save({validateBeforeSave:false});

      res.status(200).json({
        success:true,

      })
})

// get all reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req,res,next)=>{

    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
})

// delete review
exports.deleteReview = catchAsyncErrors(async (req,res,next)=>{

    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("product not found",404));
    }

    const reviews = product.reviews.filter(
        (rev)=> rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;

    reviews.forEach((rev)=>{
        avg += rev.rating;
    });

    const ratings = avg / reviews.length;

    const numOfReviews = reviews.length;

    await product.findByIdAndUpdate(
        req.query.productId,
        {
        reviews,
        ratings,
        numOfReviews
        },{
        new:true,
        runValidators:true,
        useFindAndModify:false
        }
    );

    res.status(200).json({
        success:true
    })
})
