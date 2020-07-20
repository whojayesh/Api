const express = require('express');
const reviewController = require('./../controllers/reviewController');
const AppError = require('./../utils/appError');

const router = express.Router();

router.route('/')
    .get(reviewController.getAllReview)
    .post(reviewController.createReview);

router.all('*', (req, res, next) => {
    next(new AppError('This route is not define', 404));
});


module.exports = router;