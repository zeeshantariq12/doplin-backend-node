const mongoose = require('mongoose')
const Joi = require('joi').extend(require('@joi/date'))

const Schema = mongoose.Schema

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
  },
  message: String,
  sendDate: String,
})

const validation = Joi.object({
  message: Joi.string().trim(true).required(),
  sendDate: Joi.date().format('DD/MM/YY').required(),
})

const Notification = mongoose.model('Notification', notificationSchema)
exports.Notification = Notification
exports.NotificationValidations = validation
