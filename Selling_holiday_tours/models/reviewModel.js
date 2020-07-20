const mongoose = require('mongoose');
const Tour = require('./tourModel');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema({

    review: {
        type: String,
        required: [true, 'It cannot be empty']
    },

    rating: {
        type: Number,
        min: [1, 'The minium rating should be 1'],
        max: [5, 'The maxium rating should be 5']
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to the tour']
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to the user']
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

reviewSchema.index({
    tour: 1,
    user: 1
}, {
    unique: true
});

reviewSchema.pre(/^find/, function (next) {

    console.log('hi');
    this
           .populate({
                  path: 'user',
                  select: 'name'
           })
     .populate({
            path: 'tour',
            select: 'name'
     });
     
    next();
});


reviewSchema.pre(/^find/, function (next) {
    this.select('-__v');
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

