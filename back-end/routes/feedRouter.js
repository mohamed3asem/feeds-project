const express = require('express')
const feedControllers = require('../controllers/feedController')
const authControllers = require('../controllers/authControllers')

const router = express.Router()

router.use(authControllers.isLoggedIn)

router.route('/posts')
    .get( feedControllers.getPosts)

router.route('/post')
    .post(feedControllers.uploadPostPhoto, feedControllers.createPost)

router.route('/post/:id')
    .get(feedControllers.getPost)
    .patch(feedControllers.uploadPostPhoto, feedControllers.updatePost)
    .delete(feedControllers.deletePost)


module.exports = router