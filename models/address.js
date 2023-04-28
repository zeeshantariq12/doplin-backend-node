const mongoose = require('mongoose')

const Schema = mongoose.Schema

const addressSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    require: true,
  },
  country: String,
  state: String,
  city: String,
  area: String,
  houseNumber: String,
  streetNumber: String,
})

const Address = mongoose.model('Address', addressSchema)
exports.Address = Address
