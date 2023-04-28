const { Schema, model, Types } = require('mongoose')
const Joi = require('joi')
const jwt = require('jsonwebtoken')

const updateRequestSchema = new Schema({
  shopId: String,
  name: String,
  email: String,
  password: String,
  longitude: Number,
  latitude: Number,
})

updateRequestSchema.methods.genAuthToken = function () {
  const token = jwt.sign(
    {
      email: this.email,
      _id: this._id.toString(),
      role: this.role,
    },
    process.env.SUPER_KEY,
    { expiresIn: '1h' }
  )

  return token
}

const validation = Joi.object({
  name: Joi.string().min(3).max(25).trim(true).required(),
  email: Joi.string().email().trim(true).required(),
  password: Joi.string().min(8).trim(true).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
})

const UpdateRequest = model('UpdateRequest', updateRequestSchema)
exports.UpdateRequest = UpdateRequest
exports.UpdateRequestValidation = validation
