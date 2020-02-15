
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const catchAsync = require('../utilis/catchAsync')
const APPError = require('../utilis/appError')
const User = require('../models/userModel')


exports.signUp = catchAsync( async (req, res) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        status: req.body.status
    })

    res.status(201).json({
        status: 'success',
        newUser
    })
})

exports.login = catchAsync( async (req, res, next) => {
    const {email, password} = req.body
    if (!email || !password) return next(new APPError('please provide email and password', 400))

    const user = await User.findOne({ email }).select('+password')
    if (!user || ! await user.isMatched(password, user.password)) {
        return next(new APPError('incorrect email or password', 401))
    }
    
    const token = jwt.sign(
        { id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN}
        )

    res.status(200).json({
        status: 'succes',
        token,
        userId: user._id
    })
})

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    
    // get the token and cgeck if it is there
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if(!token) return next(new APPError('you are not logged in! please login to get access', 401))
    
    //verification the token
    const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // check if the user still exist
    const user = await User.findById(decoded.id).select('_id name status')
    if(!user) return next(new APPError('the user belong to this token is no longer exists', 401))

    // check if the user change the password after creating the token
    if(user.changedPasswordAfter(decoded.iat)) {
        return next(new APPError('User recently changed password! please login again', 401))
    }
    
    req.user = user
    next()
})

exports.getUsers =async (req, res) => {
    const users = await User.find()

    res.status(200).json({
        status: 'success',
        users
    })
}