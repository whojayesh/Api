const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const tourRouter = express.Router();


//tourRouter.param('id', tourController.checkId);

tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);
tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

tourRouter.route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createNewTour);

tourRouter.route('/:id')
    .get(tourController.getTour)
    .delete(authController.protect, authController.restrictTo('admin') ,tourController.deleteTour)
    .patch(tourController.updateTour);

module.exports = tourRouter;