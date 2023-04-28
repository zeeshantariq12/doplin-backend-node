const path = require('path')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const cloudinary = require('cloudinary').v2
const XLSX = require('xlsx')
const nodemailer = require('nodemailer')

const { StatusCodes } = require('http-status-codes')
const { Product } = require('../models/product')
const { Shop } = require('../models/shop')
const { UpdateRequest } = require('../models/updateRequests')
const { OrderedProduct } = require('../models/orderedProduct')
const { Order } = require('../models/order')
const { Language } = require('../models/language')
const { Rating } = require('../models/rating')
const { UserConversation } = require('../models/userConversation')
const { Conversation } = require('../models/conversation')
const { Message } = require('../models/message')
const { Notification } = require('../models/notification')

const { required } = require('joi')

var transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '9b7908fdc202ef',
    pass: '1f751e6d25a72c',
  },
})

exports.myShop = async (req, res, next) => {
  const shopId = req.user._id
  const shop = await Shop.findById(shopId)
  try {
    if (!shop) {
      return res.status(404).send('Could not find Shop')
    }
    res.status(200).json({ shop: shop })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.myProducts = async (req, res, next) => {
  try {
    const { ln } = req.params
    const shopId = req.user._id

    const currentPage = parseInt(req.query.page) || 1
    const perPage = parseInt(req.query.limit) || 10

    let totalItems = await Product.find({
      creator: shopId,
    }).countDocuments()

    if (totalItems == 0) {
      return res.json({ error: 'You dont have any product' })
    }
    const products = await Product.find({ creator: shopId })
      .populate('category')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)

    const prods = await Promise.all(
      products.map(async (product) => {
        const rating = await getRatings(product._id)

        let productName = product.name.get(ln)
        let productDescription = product.description.get(ln)
        let productFeatures = product.features.get(ln)
        let categoryName = product.category.name.get(ln)

        if (productName == '') {
          productName = product.name.get('en-US')
        }
        if (productDescription == '') {
          productDescription = product.description.get('en-US')
        }
        if (productFeatures == '') {
          productFeatures = product.features.get('en-US')
        }
        if (categoryName == '') {
          categoryName = product.category.name.get('en-US')
        }
        return {
          ...product._doc,
          name: productName,
          description: productFeatures,
          features: productFeatures,
          category: categoryName,
          rating,
        }
      })
    )
    return res.json({
      products: prods,
      totalpages: Math.ceil(totalItems / perPage),
    })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.getProduct = async (req, res, next) => {
  try {
    const { ln, productId } = req.params
    const product = await Product.findById(productId).populate('category')
    if (req.user._id.toString() !== product.creator.toString()) {
      return res.status(401).send({ error: 'Not Authorized' })
    }
    if (!product) {
      return res.status(404).send({ error: 'Could not find Product.' })
    }
    let productName = product.name.get(ln)
    let productDescription = product.description.get(ln)
    let productFeatures = product.features.get(ln)
    let categoryName = product.category.name.get(ln)

    if (productName == '') {
      productName = product.name.get('en-US')
    }
    if (productDescription == '') {
      productDescription = product.description.get('en-US')
    }
    if (productFeatures == '') {
      productFeatures = product.features.get('en-US')
    }
    if (categoryName == '') {
      categoryName = product.category.name.get('en-US')
    }

    const category = {
      _id: product.category._id,
      name: categoryName,
    }

    const rating = await getRatings(productId)

    let fetchedProduct = {
      ...product._doc,
      name: productName,
      description: productFeatures,
      features: productFeatures,
      category: category,
      rating,
    }

    res
      .status(200)
      .json({ message: 'Product fetched.', product: fetchedProduct })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.updateShop = async (req, res, next) => {
  try {
    const shopId = req.user._id
    const { name, email, password, longitude, latitude } = req.body
    let pass = password
    if (password) {
      const hashedPw = await bcrypt.hash(password, 12)
      pass = hashedPw
    }

    const updateRequest = new UpdateRequest({
      shopId: shopId,
      name: name,
      email: email,
      password: pass,
      longitude: longitude,
      latitude: latitude,
    })

    await updateRequest.save()
    res.status(200).json({ message: 'Request sent Successfully to SuperAdmin' })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.addProduct = async (req, res) => {
  try {
    const file = req.file
    const { ln } = req.params
    const {
      name,
      quantity,
      sellingPrice,
      category,
      retailPrice,
      description,
      brandName,
      features,
    } = req.body

    if (!req.file) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ error: 'please add an image for this product' })
    }

    let imagePath = await cloudinary.uploader.upload(file.path)

    let obj = {
      quantity,
      sellingPrice,
      retailPrice,
      imageUrl: imagePath.secure_url,
      creator: req.user._id,
      category,
      brandName,
    }

    const dblanguages = await Language.find()

    let languages = dblanguages.map((language) => {
      return language.code
    })

    languages = languages.reduce((acc, curr) => ((acc[curr] = ''), acc), {})

    obj = {
      ...obj,
      name: { ...languages, [ln]: name },
      description: { ...languages, [ln]: description },
      features: { ...languages, [ln]: features },
    }

    const product = new Product(obj)

    await product.save()
    clearImage(file.path)
    const createdProduct = await Product.findById({
      _id: product._id,
    }).populate('category')

    res.status(201).json({
      message: 'Product created!',
      product: createdProduct,
    })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.updateProduct = async (req, res) => {
  try {
    const { productId, ln } = req.params

    const {
      name,
      quantity,
      sellingPrice,
      category,
      retailPrice,
      description,
      brandName,
      features,
    } = req.body

    let imageUrl
    if (req.file) {
      let imagePath = await cloudinary.uploader.upload(req.file.path)
      imageUrl = imagePath.secure_url
      clearImage(req.file.path)
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).send({ error: 'Could not find product' })
    }
    if (product.creator.toString() !== req.user._id) {
      return res.status(403).send({ error: 'Not authorized!' })
    }
    if (imageUrl && imageUrl !== product.imageUrl) {
      var filename = product.imageUrl.split('/').pop()
      filename = filename.split('.')[0]
      cloudinary.uploader.destroy(filename)
    }
    product.name.set(ln, name)
    product.description.set(ln, description)
    product.features.set(ln, features)

    product.quantity = quantity
    product.sellingPrice = sellingPrice
    product.retailPrice = retailPrice
    product.brandName = brandName
    if (imageUrl) {
      product.imageUrl = imageUrl
    }
    product.category = category

    const result = await product.save()

    res.status(200).send({ message: 'Product updated!', product: result })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId
  try {
    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).send({ error: 'Could not find product' })
    }
    if (product.creator.toString() !== req.user._id) {
      return res.status(403).send({ error: 'Not authorized!' })
    }
    const conversations = await Conversation.find({ productId: productId })

    const ordered = await OrderedProduct.find({ productId: productId })
    if (ordered.length > 0) {
      ordered.forEach(async (order) => {
        let isPending = await Order.find({
          _id: order.orderId,
          status: 'pending',
        })
        if (isPending.length > 0) {
          return res.status(400).send({
            error:
              "You can't delete this product right now, because it's order status is pending",
          })
        } else {
          var filename = product.imageUrl.split('/').pop()
          filename = filename.split('.')[0]
          cloudinary.uploader.destroy(filename)
          await Product.findByIdAndRemove(productId)
          conversations.forEach(async (conversation) => {
            await Message.deleteMany({ conversation: conversation._id })
            await UserConversation.deleteMany({
              conversation: conversation._id,
            })
          })
          await Conversation.deleteMany({ productId: productId })

          return res.status(200).send({ message: 'Product Deleted.' })
        }
      })
    } else {
      var filename = product.imageUrl.split('/').pop()
      filename = filename.split('.')[0]
      cloudinary.uploader.destroy(filename)
      await Product.findByIdAndRemove(productId)
      conversations.forEach(async (conversation) => {
        await Message.deleteMany({
          conversation: conversation._id,
        })
        await UserConversation.deleteMany({
          conversation: conversation._id,
        })
      })
      await Conversation.deleteMany({ productId: productId })

      return res.status(200).send({ message: 'Product Deleted.' })
    }
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.uploadProducts = async (req, res, next) => {
  try {
    const { ln } = req.params
    var workbook = XLSX.readFile(req.file.path)

    var sheet_namelist = workbook.SheetNames
    var x = 0

    // start getting languages from data base
    const dblanguages = await Language.find()

    let languages = dblanguages.map((language) => {
      return language.code
    })

    languages = languages.reduce((acc, curr) => ((acc[curr] = ''), acc), {})
    // end getting languages.

    sheet_namelist.forEach((element) => {
      var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[x]])

      // Product.insertMany(xlData);
      xlData.forEach(async (data) => {
        obj = {
          name: { ...languages, [ln]: data.name },
          description: { ...languages, [ln]: data.description },
          features: { ...languages, [ln]: data.features },
          quantity: data.quantity,
          imageUrl: data.imageUrl,
          sellingPrice: data.sellingPrice,
          retailPrice: data.retailPrice,
          brandName: data.brandName,
          creator: req.user._id,
          category: data.category,
        }
        const product = new Product(obj)
        const result = await product.save()
      })

      x++
    })
    clearImage(req.file.path)
    return res.status(200).send({ message: 'Products Entered Successfully!' })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.orders = async (req, res, next) => {
  try {
    const { ln } = req.params
    const currentPage = parseInt(req.query.page) || 1
    const perPage = parseInt(req.query.limit) || 10

    const shopId = req.user._id

    let totalItems = await OrderedProduct.find({
      shopId: shopId,
    }).countDocuments()

    if (totalItems == 0) {
      return res.json({ error: 'You dont have any order' })
    }

    const orders = await OrderedProduct.find({ shopId: shopId })
      .populate('productId orderId')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
    let name
    const newOrders = orders.map((order) => {
      name = order.productId.name.get(ln)
      if (name == '') {
        name = order.productId.name.get('en-US')
      }
      return {
        ...order._doc,
        productId: order.productId._id,
        productName: name,
        orderId: order.orderId._id,
        orderStatus: order.orderId.status,
      }
    })
    return res.json({
      orders: newOrders,
      totalpages: Math.ceil(totalItems / perPage),
    })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.orderId
    const shop = await OrderedProduct.findOne({ orderId: orderId })

    if (shop.shopId.toString() !== req.user._id) {
      return res.status(401).send({ error: 'Not Authanticted' })
    }
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).send({ error: 'order not found' })
    }
    order.status = 'delivered'
    await order.save()
    const msg = 'Your order #' + order.orderId + ' is Delivered'
    var message = {
      app_id: process.env.ONE_SIGNAL_APP_ID,
      contents: {
        en: msg,
      },
      data: { orderId },
      channel_for_external_user_ids: 'push',
      include_external_user_ids: [order.customerId],
    }

    sendNotification(message)

    const notification = new Notification({
      user: order.customerId,
      from: req.user._id,
      message: msg,
      sendDate: new Date(),
    })
    await notification.save()

    return res.json({ message: 'Staus updated successfully!' })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.downloadProductsList = async (req, res, next) => {
  try {
    var wb = XLSX.utils.book_new() //new workbook
    Product.find((err, data) => {
      if (err) {
        console.log(err)
      } else {
        var temp = JSON.stringify(data)
        temp = JSON.parse(temp)
        var ws = XLSX.utils.json_to_sheet(temp)

        var down = path.basename('/uploads/products.xlsx')

        XLSX.utils.book_append_sheet(wb, ws, 'sheet1')
        XLSX.writeFile(wb, down)
        res.download(down)
      }
    })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.sendEmail = async (req, res, next) => {
  try {
    const { email } = req.body

    const shop = await Shop.findOne({ email: email })
    if (!shop) {
      return res.status(404).send({ error: 'Shop with this email not exist' })
    }

    const code = Math.floor(Math.random() * (99999 - 10000) + 10000)

    transporter.sendMail({
      to: email,
      from: 'amazonClon@gmail.com',
      subject: 'Password reset link',
      html:
        '<h2>Your requested to reset your account password.</h2></br><br>Use the given confirmation code to reset your password</br>code: ' +
        code,
    })
    return res.status(200).send({
      message: 'Email sent to ' + email + ' with password reset code',
      code: code,
      email: email,
    })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const shop = await Shop.findOne({ email: email })
    const hashedPw = await bcrypt.hash(password, 12)

    shop.password = hashedPw
    await shop.save()
    res.status(200).send({ message: 'Your password updated successfuly.' })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.getConversations = async (req, res, next) => {
  try {
    const shop = req.user._id
    const { ln } = req.params
    const conversations = await UserConversation.find({ shop: shop }).populate(
      'conversation'
    )

    const updatedConverstion = await Promise.all(
      conversations.map(async (conv) => {
        const productDetails = await Product.findById(
          conv.conversation.productId
        )
        console.log(productDetails)
        let name = productDetails.name.get(ln)
        if (name == '') {
          name = productDetails.name.get('en-US')
        }
        return {
          ...conv._doc,
          productName: name,
          productImage: productDetails.imageUrl,
        }
      })
    )

    return res.status(200).send({ conversations: updatedConverstion })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

const getRatings = async (productId) => {
  const ratings = await Rating.find({
    product: productId,
  })

  const ratingsSum = ratings.reduce(function (total, currentValue) {
    return total + currentValue.rating
  }, 0)

  const average = ratingsSum / ratings.length
  return { totalRatings: ratings.length, avg: average }
}

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath)
  fs.unlink(filePath, (err) => console.log(err))
}

const sendNotification = (data) => {
  const key = 'Basic ' + process.env.ONE_SIGNAL_REST_API_KEY
  var headers = {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: key,
  }

  var options = {
    host: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: headers,
  }

  var https = require('https')
  var req = https.request(options, function (res) {
    res.on('data', function (data) {
      console.log('Response:')
      console.log(JSON.parse(data))
    })
  })

  req.on('error', function (e) {
    console.log('ERROR:')
    console.log(e)
  })

  req.write(JSON.stringify(data))
  req.end()
}
