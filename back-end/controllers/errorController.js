const APPError = require('../utilis/appError')

const sendErrDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        err: err,
        stack: err.stack
    })
}

const sendErrprod = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        console.error('Error', err)
        res.status(500).json({
            status: 'Error',
            message: 'Sorry! something go wrong'
        })    
    }
}

const handleCAstError = err => {
    const message = `Inavlid ${err.path}: ${err.value}`
    return new APPError(message, 400)
}

const handleDuplicatFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
    const message = `Duplicate field value: ${value}. please use another value`
    // const message = `Email is already exists`
    return new APPError(message, 400)
}

const handleValidationError = err => {
    const message = err.message
    return new APPError(message, 400)
}

const handleJWTExpiredError = () => new APPError('Your token has expired!. Please log in again', 401)

const handleJWTError = () => new APPError('Invalid token. Please log in again', 401)


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'Error'
    
    if (err.name === 'CastError') err = handleCAstError(err)
    if (err.code === 11000) err = handleDuplicatFieldsDB(err)
    if (err.name === 'ValidatorError' || 'ValidationError') err = handleValidationError(err)
    if (err.name === 'JsonWebTokenError') err = handleJWTError()
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError()
    if(process.env.NODE_ENV === 'development') {
        sendErrDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        sendErrprod(err, res)
    }
}