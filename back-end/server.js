const dotenv = require('dotenv')
dotenv.config({path: './config.env'})

const app = require('./app')
const mongoose = require('mongoose')

process.on('uncaughtException', err => {
    console.log('uncaughtException! Shutting down...')
    console.log(err.name, err.message, err)
    process.exit(1)
})

mongoose.connect(process.env.DATABASE,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
    }
).then(()=> {
    console.log('Database connected successfully')
})

console.log(process.env.NODE_ENV)

const server = app.listen(8080, () => {
    console.log('app is on port 8080')
})

const io = require('./socket').init(server)
io.on('connection', socket => {
    console.log('Client connected')
})

process.on('unhandledRejection', err => {
    console.log('unhandledRejection! Shutting down...')
    console.log(err.name, err.message)
    console.log(err)
    server.close(() => {
        process.exit(1)
    })
})