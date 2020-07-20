const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid  ${err.path}:  ${err.value}.`;
    return new AppError(message, 404);
};

const handleDuplicateFieldsDB = (err) => {

    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
    const message = `Duplicate Field value = ${value[0]}. Please use any other value`;
    return new AppError(message, 404);
};

const handleValidationErrorDB = (err) => {

    console.log(Object.values(err.errors));
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. = ${errors.join(',')}`;
    //message or err.message will also work fine (just apply sustring for more specific)
    return new AppError(err.message, 404);

}

const handleJsonWebTokenError = (err) =>{

    const error = new AppError('Invalid token, please log in again', 401);
    return error;

}

const handleTokenExpiredError = (err) =>{

    const error = new AppError('token expired, please log in again', 401);
    return error;

}

const sendErrorDevelopment = (err, res) => {

    res
        .status(err.statusCode)
        .json({
            status: err.status,
            message: err.message
        });

};

const sendErrorProduction = (err, res) => {

    //Operational error - client's error
    if (err.isOperational) {
        res
            .status(err.statusCode)
            .json({
                status: err.status,
                message: err.message,
                stack: err.stack
            });
    } else {
        //Programming error, no idea where it is coming from - developer fault - don't leak details'

        // 1. log error in conole for developer to see it
        //console.log(err);
        // 2. send the generic error
        res
            .status(err.statusCode)
            .json({
                status: err.status,
                message: 'Something went veryy wrong!!😓',
                message: err.message,
                name: err.name,
                err,
                stack: err.stack
            });
    }

};


module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';


    if (err.name === 'CastError') {
        sendErrorProduction(handleCastErrorDB(err), res);
    } else if (err.code === 11000) {
        sendErrorProduction(handleDuplicateFieldsDB(err), res);
    } else if (err.name === 'ValidationError') {
        sendErrorProduction(handleValidationErrorDB(err), res);
    }
    else if(err.name === 'JsonWebTokenError')
    {
        sendErrorProduction(handleJsonWebTokenError(err), res);
    }
    else if(err.name === 'TokenExpiredError')
    {
        sendErrorProduction(handleTokenExpiredError(err), res);
    }
    
    else {
        sendErrorProduction(err, res);
    }


}