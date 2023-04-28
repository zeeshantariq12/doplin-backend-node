const mongoose = require('mongoose')
const Joi = require('joi')

const Schema = mongoose.Schema

const orderSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    require: true,
  },
  addressId: {
    type: Schema.Types.ObjectId,
    ref: 'Address',
    require: true,
  },
  orderId: String,
  status: {
    type: String,
  },
  totalPrice: {
    type: Number,
  },
  deliveryDate: String,
})

const validation = Joi.object({
  orderId: Joi.string().required(),
  status: Joi.string().default('Pending'),
  totalPrice: Joi.number().positive().greater(1).precision(2).required(),
})
const Order = mongoose.model('Order', orderSchema)
exports.Order = Order
exports.OrderValidations = validation
