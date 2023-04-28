const mongoose = require('mongoose')
const Joi = require('joi').extend(require('@joi/date'))

const Schema = mongoose.Schema

const cardSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    require: true,
  },
  firstName: String,
  lastName: String,
  cardNumber: Number,
  expiryDate: String,
  securityCode: Number,
})

const validation = Joi.object({
  firstName: Joi.string().trim(true).required(),
  lastName: Joi.string().trim(true).required(),
  cardNumber: Joi.number().required(),
  securityCode: Joi.number().required(),
  expiryDate: Joi.date().format('MM/YY').required(),
})

const Card = mongoose.model('Card', cardSchema)
exports.Card = Card
exports.CardValidations = validation
