const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: [ true, 'Please provide a title' ],
        minlength: [ 5, 'title must be 5 characters at least' ]
    },
    image: {
        type: String,
        required: [ true, 'Please provide an image' ]
    },
    content: {
        type: String,
        required: [ true, 'Please provide a content' ]
    },
    creator: {
        type: Object,
        required: true
    }
},
{timestamps: true}
)

const Post = mongoose.model('Post', postSchema)

module.exports = Post