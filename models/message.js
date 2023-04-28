const mongoose = require('mongoose')
const Joi = require('joi').extend(require('@joi/date'))

const Schema = mongoose.Schema

const messageSchema = new Schema({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    require: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
  },
  shop: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
  },
  sender: String,
  message: String,
  sendDate: String,
})

const validation = Joi.object({
  message: Joi.string().trim(true).required(),
  sender: Joi.string().trim(true).required(),
  sendDate: Joi.date().format('DD/MM/YY').required(),
})

const Message = mongoose.model('Message', messageSchema)
exports.Message = Message
exports.MessageValidations = validation
