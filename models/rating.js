const Joi = require('joi')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ratingSchema = new Schema({
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
  rating: Number,
})

const Rating = mongoose.model('Rating', ratingSchema)
exports.Rating = Rating
