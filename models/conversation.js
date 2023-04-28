const mongoose = require('mongoose')
const Joi = require('joi').extend(require('@joi/date'))

const Schema = mongoose.Schema

const conversationSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    require: true,
  },
  chatRoom: String,
})

const validation = Joi.object({
  chatRoom: Joi.string().trim(true).required(),
})

const Conversation = mongoose.model('Conversation', conversationSchema)
exports.Conversation = Conversation
exports.ConversationValidations = validation
