const { Schema, model } = require('mongoose')

const rolesSchema = new Schema({
  name: { type: String, required: true },
})

const Role = model('Role', rolesSchema)

exports.Role = Role
