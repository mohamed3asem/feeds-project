const express = require('express')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')

const feedRouter = require('./routes/feedRouter')
const userRouter = require('./routes/userRouter')
const errorHandler = require('./controllers/errorController')
const APPError = require('./utilis/appError')

const app = express()

// ====GLOBAL MIDDLEWARES====
// allow cors

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

// set security HTTP HEADERS
app.use(helmet())

//limit requests from same api
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, Please try again in an hour'
})
app.use(limiter)

// data sanitization  againt XSS
app.use(xss())

// body parser
app.use(express.json({ limit: '10kb' }))

// data sanitization againt NOSQL query injection
app.use(mongoSanitize())

// =====ROUTES========
app.use('/feed', feedRouter)
app.use('/users', userRouter)

app.all('*', (req, res, next) => {
    next(new APPError(`Can't find ${req.originalUrl} on this server`, 404)) 
})
app.use(errorHandler)

module.exports = app