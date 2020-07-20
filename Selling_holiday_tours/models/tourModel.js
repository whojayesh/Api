const mongoose = require('mongoose');
const slugify = require('slugify'); //not much of use in my opinion
const validator = require('validator');


const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: [true, 'Your tour name must be unique'],
        trim: true,
        maxLength: [40, 'A tour name cannot be longer than 40 characters'],
        minLength: [10, 'A tour name cannot be less than 10 characters']
        //validate: [validator.isAlpha, 'Name must only contain alphabetic characters'] //discard because space not allowed.
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a max group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty level mention'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, or difficult'
        }
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                //this points to the new doc which has been created and hence it cannot be applied to update.
                return val < this.price //return boolean
            },
            message: 'Discount price must be less than the price'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4,
        min: [1, 'Rating must be above 0'],
        max: [5, 'A rating must be below 5'],
        set: val => Math.round(val * 10) / 10       //4.6666 - 4.7
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a imageCover']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    // 1 to 1 // 1 tour 1 location
    startLocation: {
        //geoJSON

        type: {
            type: String,
            default: 'Point', //polygon, line
            enum: ['Point']
        },
        coordinates: [Number], //[longitude, latitude] but in google map first is [latitude, longitude]
        address: String,
        desription: String
    },

    // 1 to many // 1 tour many locations
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number //day in which people will go , first day the start day.
    }],

    //guides: Array
    guides: [{
        type: mongoose.Schema.ObjectId, //foreign key
        ref: 'User' //reference User
    }],
    /*
        reviews: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Review'
        }]
    */

}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});


//tourSchema.virtual('colname').get();

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});



// DOCUMENT MIDDLEWARE = save or create
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true
    });
    next();
});


tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides'
    });
    next();
});

/*
tourSchema.pre('save', function(next){
    console.log('Document is saving...');
    next();
});

tourSchema.post('save', function(doc,next){
    //console.log(doc);
    next();
});
*/


//QUERY MIDDLEWARE
/*
tourSchema.pre(/^find/, function (next) {
    this.find({
        secretTour: {
            $ne: true
        }
    });
    next();
});
*/
/*
tourSchema.post(/^find/, function(docs, next){
    console.log(docs);
    next();
});
*/

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        $match: {
            secretTour: {
                $ne: true
            }
        }
    });
    next();
});


const Tour = new mongoose.model('Tour', tourSchema);

module.exports = Tour;