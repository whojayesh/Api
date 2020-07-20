const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

exports.createReview = catchAsync( async (req, res) => {

    console.log(req.body);

    const user = await Review.create({
        review: req.body.review,
        rating: req.body.rating,
        tour: req.body.tour,
        user: req.body.user,
    });

    console.log(user);

    res
    .status(200)
    .json({
        status: 'success',
        data: {
            user
        }
    });

});

exports.getAllReview = catchAsync( async (req, res) => {

    const reviews = await Review.find();

    res
    .status(200)
    .json({
        status: 'success',
        data: {
            reviews
        }
    });

});