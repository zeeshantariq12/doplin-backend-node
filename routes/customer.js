const express = require('express')
const router = express.Router()

const isAuth = require('../middleware/is-auth')
const customerController = require('../controller/customer')

router.put('/update-customer', isAuth, customerController.updateCustomer)
router.post('/:ln/add-to-order', isAuth, customerController.addToOrder)
router.get('/my-orders', isAuth, customerController.myOrders)
router.get('/order-detail/:orderId', isAuth, customerController.orderDetails)
router.get('/orders-history', isAuth, customerController.orderHistory)
router.post('/send-code', customerController.sendEmailAndMessage)
router.put('/reset-password', customerController.resetPassword)
router.get('/countries-list', customerController.getCountries)
router.get('/states-list/:countryCode', customerController.getStates)
router.get('/cities-list/:countryCode/:stateCode', customerController.getCities)
router.post('/add-new-address', isAuth, customerController.addNewAddress)
router.delete(
  '/delete-address/:addressId',
  isAuth,
  customerController.deleteAddress
)
router.get('/get-addresses', isAuth, customerController.getAddresses)
router.post('/add-card', isAuth, customerController.addCard)
router.get('/get-card', isAuth, customerController.getCard)
router.post('/add-rating', isAuth, customerController.addRating)
router.post('/:ln/create-chat', isAuth, customerController.createChat)
router.post('/send-message', isAuth, customerController.sendMessage)
router.get('/get-messages/:conversation', isAuth, customerController.getMessges)
router.get('/:ln/conversations', isAuth, customerController.getConversations)
router.post('/add-review', isAuth, customerController.addReview)
router.delete('/delete-review/:review', isAuth, customerController.deleteReview)
router.delete(
  '/clear-notificatins',
  isAuth,
  customerController.clearNotofications
)
router.get('/get-notifications', isAuth, customerController.getNotificatins)

module.exports = router
