require('dotenv').config()
const mongoose = require('mongoose')

const connetToDataBase = async () => {
  const result = await mongoose.connect(process.env.MONGO_URL)
  if (result) {
    console.log('Connected to mongoDb...')
  } else {
    console.log('Failed to connect to mongodb...')
  }
}

module.exports = connetToDataBase
