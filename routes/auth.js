const express = require('express')
const passport = require('passport')
require('../controller/googleAuth')(passport)
const authController = require('../controller/auth')
const router = express.Router()

router.post('/shop/login', authController.shopLogin)
router.post('/admin/login', authController.adminLogin)
router.post('/customer/signup', authController.customerSignup)
router.post('/customer/login', authController.customerLogin)

router.post('/social-login', authController.socialLogin)

module.exports = router
