const mongoose = require('mongoose')
const Joi = require('joi')

const Schema = mongoose.Schema

const categorySchema = new Schema({
  name: {
    type: Map,
    of: String,
  },
  imageUrl: String,
})

const validation = Joi.object({
  imageUrl: Joi.string().trim(true).required(),
})

const Category = mongoose.model('Category', categorySchema)
exports.Category = Category
exports.CategoryValidations = validation
