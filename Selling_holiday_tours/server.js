const mongoose = require('mongoose');

//Uncaught exception
process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION 🔴 Shutting down');
    process.exit(1); // 0=success, 1=uncaught_exception
});


const app = require('./app');



//mongodb+srv://username:username@cluster0.c2eto.mongodb.net/test
//mongodb+srv://username:<PASSWORD>@cluster0.c2eto.mongodb.net/<DATABASE_NAME>?retryWrites=true&w=majority'
const DB = 'mongodb+srv://username:username@cluster0.c2eto.mongodb.net/Natours_New?retryWrites=true&w=majority';
mongoose.connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(con => {
        //console.log(con.connection);
        console.log('DB connection is successful');
    });
//.catch( err => console.log('ERROR IN SERVER-PAGE') );


//start the server
const server = app.listen(3000, () => {
    console.log("start the server on port 3000");
});

//unhandled promise exception - chacnge the password.
process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('unhandledRejection 🚨 Shutting down');
    server.close(() => {
        process.exit(1); // 0=success, 1=uncaught_exception
    });
});

//console.log(x);


