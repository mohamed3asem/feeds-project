const APPError = require('./utilis/appError')

let io

module.exports = {
    init: HTTPServer => {
        io = require('socket.io')(HTTPServer)
        return io
    },
    getIo: () => {
        if (!io) {
            new APPError('socket.io not initialized', 500)
        }
        return io
    }
}