const mongoose = require('mongoose')
const Joi = require('joi')
const Schema = mongoose.Schema

const orderedProductSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    require: true,
  },
  shopId: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    require: true,
  },
  quantity: Number,
  unitPrice: Number,
  name: String,
})

// module.exports = mongoose.model("OrderedProduct", orderedProductSchema);

const validation = Joi.object({
  quantity: Joi.number().required().min(1),
  unitPrice: Joi.number().positive().greater(1).precision(2).required(),
})
const OrderedProduct = mongoose.model('OrderedProduct', orderedProductSchema)
exports.OrderedProduct = OrderedProduct
exports.OrderedProductValidations = validation
