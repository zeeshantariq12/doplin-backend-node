const mongoose = require('mongoose')
const Joi = require('joi')

const Schema = mongoose.Schema

const languageSchema = new Schema({
  name: String,
  code: String,
})

const validation = Joi.object({
  name: Joi.string().trim(true).required(),
  code: Joi.string().trim(true).required(),
})

const Language = mongoose.model('Language', languageSchema)
exports.Language = Language
exports.languageValidations = validation
