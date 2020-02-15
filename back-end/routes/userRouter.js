const express = require('express')
const authControllers = require('../controllers/authControllers')
const userControllers = require('../controllers/userControllers')

const router = express.Router()

router.route('/signup')
    .post(authControllers.signUp)

router.route('/login')
    .post(authControllers.login)

router.route('/me')
    .get(authControllers.isLoggedIn, userControllers.getMe)   
    
// router.route('/users')
//     .get(authControllers.getUsers)    

module.exports = router