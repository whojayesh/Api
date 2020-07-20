const fs = require('fs');
const mongoose = require('mongoose');

//IMPOTR THE MODELS
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

//RETRIEVE DATA FROM THE FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//CONNECTION OF DB
const DB = 'mongodb+srv://username:username@cluster0.c2eto.mongodb.net/Natours_New?retryWrites=true&w=majority';
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    //console.log(con.connection);
    console.log('DB connection is successful');
});

//async () FOR IMPORTING THE DATA
const importData = async () => {
    try {

        await Tour.create(tours, {
            validateBeforeSave: false
        });
        await User.create(users, {
            validateBeforeSave: false
        });
        await Review.create(reviews);
        
        console.log('Data is succesfully loaded');
        process.exit();

    } catch (err) {
        console.log(err);
    }
};

//for deleting the data
const deleteData = async () => {
    try {
        await Tour.deleteMany();
       await User.deleteMany();
        await Review.deleteMany();

        console.log("data successfully deleted");
        process.exit();
    } catch (err) {
        console.log(err);
    }

};

//calling the () from the console
if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);