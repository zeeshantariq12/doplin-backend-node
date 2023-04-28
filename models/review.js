const mongoose = require('mongoose')
const Joi = require('joi').extend(require('@joi/date'))

const Schema = mongoose.Schema

const reviewSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    require: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    require: true,
  },
  comment: String,
})

const validation = Joi.object({
  comment: Joi.string().trim(true).required(),
})

const Review = mongoose.model('Review', reviewSchema)
exports.Review = Review
exports.ReviewValidations = validation
