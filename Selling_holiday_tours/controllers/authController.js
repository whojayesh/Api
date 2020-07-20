const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const filterObj = require('./../utils/filterObj');


const signToken = id => {
    const payload = {
        id
    };
    const secret_code = "17BIT0046";
    const expires = {
        expiresIn: "900d" //900 days
    }

    const token = jwt.sign(payload, secret_code, expires);
    return token;
};

exports.signUp = catchAsync(async (req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });

    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), //convert into milisec
        //secure: true, //  cookie will only be sent on https 
        httpOnly: true // cookie cannot be accessed or modified by browser and preventing cross side scripting  attack
    };

    res.cookie('jwt', token, cookieOptions);

    res
        .status(200)
        .json({
            status: 'success',
            token,
            data: {
                user
            }
        });
});


exports.login = catchAsync(async (req, res, next) => {

    // 1. check whether the email and password exists
    const {
        email,
        password
    } = req.body;
    if (!email || !password) {
        return next(new AppError(`please enter all the details`, 400));
    }

    // 2. check if user exists and password is correct
    const user = await User.findOne({
        email
    }).select('+password');
    //const check = await user.correctPassword(password, user.password);


    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError(`Incorrect email or password`, 401));
    }


    // 3. If everything is OK, send token to the client
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), //convert into milisec
        //secure: true, //  cookie will only be sent on https 
        httpOnly: true // cookie cannot be accessed or modified by browser and preventing cross side scripting  attack
    };

    res.cookie('jwt', token, cookieOptions);

    res
        .status(200)
        .json({
            status: 'success',
            token,
            data: {
                user
            }
        });

});

exports.protect = catchAsync(async (req, res, next) => {

    // 1. RETRIEVE THE TOKEN FROM THE HEADER
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    //2. IF NOT PRESENT SEND NOT AUTHORIZED
    if (!token) {
        return next(new AppError(`You are not Logged In, please log in to access tour`, 401));
    }



    //3. VERIFICATION TOKEN 
    const decoded = await jwt.verify(token, '17BIT0046');
    //console.log(decoded);

    // 4. CHECK IF USER exists
    const user = await User.findById(decoded.id);



    if (!user) {
        return next(new AppError('The user belonging to the token does not exists', 401));
    }

    // 5. Create
    if (user.changePasswordAfter(decoded.iat)) {
        return next(new AppError('user has recently changed their password, Please login again'), 401);
    }

    // GRANT ACCESS
    req.user = user;

    next();

});

exports.restrictTo = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new AppError(`You do not have permission to perform this action`), 403);
        }

        next();

    };

};

exports.forgotPassword = catchAsync(async (req, res, next) => {

    // 1. get user based on email

    const user = await User.findOne({
        email: req.body.email
    });
    if (!user) {
        return next(new AppError('There is no user with this email address'), 404);
    }

    // 2. generate a random token and save it into the database.
    const resetToken = user.generateToken();
    await user.save({
        validateBeforeSave: false
    });

    // 3. send it to the user's email address
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = ` Forgot your password submit a PATCH request with with your new password and passwordConfirm to: ${resetURL}. \n If you did'nt forget your password, please ignore this email. `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'your password reset token(valid only for 10min)',
            message: message

        });

        res
            .status(200)
            .json({
                status: 'success',
                message: 'Token sent to email'
            });

    } catch (err) {

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({
            validateBeforeSave: false
        });

        return next(new AppError('There was an error, sending the mail. PLease try again later!', 500));

    }

});


exports.resetPassword = catchAsync(async (req, res) => {

    //1. get user based on Token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        "passwordResetToken": hashedToken,
        "passwordResetExpires": {
            $gt: Date.now()
        }
    });

    if (!user) {
        return next(new AppError('Your token has been expired, Please re-enter your email', 404));
    }

    //console.log(req.body.password + "  " + req.body.passwordConfirm);

    //2.  set the new password.
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3. update changePasswordAt property



    //4. send the token
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), //convert into milisec
        //secure: true, //  cookie will only be sent on https 
        httpOnly: true // cookie cannot be accessed or modified by browser and preventing cross side scripting  attack
    };

    res.cookie('jwt', token, cookieOptions);

    res
        .status(200)
        .json({
            status: 'success',
            token
        });

});

//IF YOUR LAPTOP IS ON, AND ANYONE CAN ACCESS YOUE ACCOUNT SO TO UPDATE THE PASSWORD HE HAS TO ENTER PASSWORD.
exports.updatePassword = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    if (!user.correctPassword(req.body.currentPassword, user.password)) {
        return next(new ApiError('Please enter the correct password'), 400);
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    const token = signToken(req.user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), //convert into milisec
        //secure: true, //  cookie will only be sent on https 
        httpOnly: true // cookie cannot be accessed or modified by browser and preventing cross side scripting  attack
    };

    res.cookie('jwt', token, cookieOptions);

    res
        .status(200)
        .json({
            status: 'success',
            token
        });

});

exports.updateMe = catchAsync(async (req, res, next) => {

    // 1.  CHECK FOR PASSWORD
    if (req.body.passwordConfirm || req.body.password) {
        return next(new AppError('You cannot update password from this url, try /updatePassword'), 404);
    }

    // 2. FILTER OUT THE UNWANTED FIELDS
    const filter = filterObj(req.body, 'name', 'email');
    const user = await User.findByIdAndUpdate(req.user._id, filter, {
        new: true,
        runValidators: true
    });

    //console.log(user);

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                user
            }
        });

});