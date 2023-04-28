const { Schema, model, Types } = require('mongoose')
const Joi = require('joi')
const jwt = require('jsonwebtoken')

const superAdminSchema = new Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
  },
})

superAdminSchema.methods.genAuthToken = function () {
  const token = jwt.sign(
    {
      email: this.email,
      _id: this._id.toString(),
      role: this.role,
    },
    process.env.SUPER_KEY
  )

  return token
}

const validation = Joi.object({
  name: Joi.string().min(3).max(25).trim(true).required(),
  email: Joi.string().email().trim(true).required(),
  password: Joi.string().min(8).trim(true).required(),
  role: Joi.string().required(),
})

const SuperAdmin = model('SuperAdmin', superAdminSchema)
exports.SuperAdmin = SuperAdmin
exports.SuperAdminValidations = validation
