const mongoose = require('mongoose')
const Joi = require('joi').extend(require('@joi/date'))

const Schema = mongoose.Schema

const keySchema = new Schema({
  name: String,
  value: String,
})

const validation = Joi.object({
  name: Joi.string().trim(true).required(),
  value: Joi.string().trim(true).required(),
})

const Key = mongoose.model('Key', keySchema)
exports.Key = Key
exports.KeyValidations = validation
