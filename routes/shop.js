const express = require('express')
const router = express.Router()

const shopController = require('../controller/shop')
const isAuth = require('../middleware/is-auth')
const imageUpload = require('../config/multerImage')()
const fileUpload = require('../config/multerFile')()

router.post(
  '/:ln/add-product',
  isAuth,
  imageUpload.single('image'),
  shopController.addProduct
)

router.delete(
  '/delete-product/:productId',
  isAuth,
  shopController.deleteProduct
)

router.put(
  '/:ln/update-product/:productId',
  isAuth,
  imageUpload.single('image'),
  shopController.updateProduct
)

router.post('/update-shop', isAuth, shopController.updateShop)
router.get('/myShop', isAuth, shopController.myShop)
router.get('/:ln/get-product/:productId', isAuth, shopController.getProduct)
router.get('/:ln/myProducts', isAuth, shopController.myProducts)
router.get('/:ln/orders', isAuth, shopController.orders)
router.put(
  '/update-order-status/:orderId',
  isAuth,
  shopController.updateOrderStatus
)
router.post(
  '/:ln/upload-products',
  fileUpload.single('excel'),
  isAuth,
  shopController.uploadProducts
)

router.get('/download-products', shopController.downloadProductsList)
router.post('/send-code', shopController.sendEmail)
router.put('/reset-password', shopController.resetPassword)
router.get('/:ln/conversations', isAuth, shopController.getConversations)

module.exports = router
