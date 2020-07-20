const fs = require('fs');
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');



exports.createNewTour = catchAsync(async (req, res, next) => {

    const newTour = await Tour.create(req.body);

    res
        .status(201)
        .json({
            status: 'success',
            data: {
                newTour
            }
        });

});



exports.updateTour = catchAsync(async (req, res, next) => {

    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedTour) {
        const error = new AppError('Invalid Id', 404);
        return next(error);
    }

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                updatedTour
            }
        });

});

exports.deleteTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        const error = new AppError('Invalid Id', 404);
        return next(error);
    }

    res
        .status(204)
        .json({
            status: 'success',
        });

});

exports.aliasTopTours = catchAsync(async (req, res, next) => {

    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';

    console.log(req.query);

    next();

});


exports.getAllTours = catchAsync(async (req, res, next) => {

    console.log(req.query);

    const features = new APIFeatures(Tour.find(), req.query);
    features
        .filter()
        .sort()
        .fields()
        .pagination();


    const tour = await features.queryObj;

    res
        .status(200)
        .json({
            status: 'success',
            results: tour.length,
            data: {
                tour
            }
        });


});

exports.getTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findById(req.params.id).populate('reviews');

    if (!tour) {
        const error = new AppError('Invalid Id', 404);
        return next(error);
    }

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                tour
            }
        });


});

exports.getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        /*{
            $match: {
                ratingsAverage: {
                    $gte: 1000
                }
            }
        },*/
        {
            $group: {
                _id: {
                    $toUpper: '$difficulty'
                },
                avgRating: {
                    $avg: '$ratingsAverage'
                },
                minPrice: {
                    $min: '$price'
                },
                maxPrice: {
                    $max: '$price'
                },
                totalRatings: {
                    $sum: '$ratingsQuantity'
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                count: 1
            }
        },
        {
            $match: {
                count: {
                    $gt: 2
                }
            }
        }

    ]);

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                stats
            }
        });

});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {


    const year = req.params.year * 1;
    const plan = await Tour.aggregate([

        {
            $unwind: '$startDates'
        },
        /*{
            $match: {startDates: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-01`)
            }}
        },*/
        {
            $group: {
                $_id: {
                    $month: '$startDates'
                },
                TotalTours: {
                    $sum: 1
                },
                tours: {
                    $push: '$name'
                }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                TotalTours: -1
            }
        },
        {
            $limit: 6
        }

    ]);

    res
        .status(200)
        .json({
            status: 'success',
            results: plan.length,
            data: {
                plan
            }
        });


});