const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview } = require('../controllers/productController');
const {isAuthenticatedUser, authorizeRoles} = require('../middleware/auth');

const router = express.Router();

router.route('/products').get(isAuthenticatedUser,getAllProducts);

router.route('/admin/products/new').post(isAuthenticatedUser,authorizeRoles("admin"),createProduct);

router
      .route('/admin/products/:id')
      .put(isAuthenticatedUser,updateProduct)
      .delete(isAuthenticatedUser,deleteProduct);

router.route('/products/:id').get(getProductDetails);

router.route('/review').put(isAuthenticatedUser,createProductReview);

router
      .route('/reviews')
      .get(getProductReviews)
      .delete(isAuthenticatedUser,deleteReview);

module.exports=router;