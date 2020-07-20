const crypto = require('crypto'); //builtin
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please tell your name']
    },
    email: {
        type: String,
        required: [true, 'please tell your email'],
        unique: [true, 'should be unique'],
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'please enter the password'],
        minLength: 8
        //select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'please enter the confirmPassword'],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: 'confirm Password must be same as password'
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    }
});


userSchema.pre('save', async function (next) {
    //If password is actually modified.
    if (!this.isModified('password')) {
        return next();
    }
    //encrypt the password
    this.password = await bcrypt.hash(this.password, 12);
    //remove the confirm password
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function () {
    if (!this.isModified('password') || this.isNew) {
           return next();
    }
    //sometimes saving to the database is slower than issuing a jwt to the client. So the password time must be before the jwt.
    this.passwordChangedAt = Date.now() - 1000;   //1000ms = 1s
    next();

});

userSchema.methods.correctPassword = async function (pass_inBody, pass_inDB) {
    return await bcrypt.compare(pass_inBody, pass_inDB);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const time = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(time, JWTTimestamp);
        return time > JWTTimestamp;
    } else {
        return false;
    }
}

userSchema.methods.generateToken = function () {
    {
        const resetToken = crypto.randomBytes(32).toString('hex');
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); //encrypt
        this.passwordResetExpires = Date.now() + 10 * 1000 * 6000; //time for expire 10ms
        //console.log(resetToken, this.passwordResetToken);
        return resetToken;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;