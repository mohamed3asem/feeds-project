const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please give us your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'please give us your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Pleasa provide a password'],
        minlength: [6,'Password must be at least 6 characters'],
        select: false
    },
    passwordChangedAt: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        default: 'Iam a new user'
    },
    posts: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Post'
        }
    ]
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    next()
})

userSchema.methods.isMatched = async function (givenPassword, savedPassword) {
    return await bcrypt.compare(givenPassword, savedPassword)
}

userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
    if(this.passwordChangedAt) {
        return jwtTimeStamp < parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    }
    // false mean not changed
    return false
}

const User = mongoose.model('User', userSchema)

module.exports = User