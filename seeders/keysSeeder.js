require('dotenv').config({ path: '../.env' })

const mongoose = require('mongoose')
const { Key } = require('../models/key')

const keysSeeder = async () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB...'))
    .catch((err) => console.error('Could not connect to MongoDb... ', err))

  const keys = [
    'STRIPE_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'MESSAGING_SERVICE_SID',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ]
  const values = [
    'sk_test_51L510HD6MLn8tqd5C7eNFKZrwPYh4p6yRCdzY25ByZwS2EYNtUqkqOWw8O4FdFNcRdNxHlU1VTD50wGmG9xKicqK00ojNx5w5N',
    'ACa4875929e7e518ac64a7f669ee37c5ac',
    '246484c93ee9a1a0be614fce3b740c4f',
    'MG56a7f4849d8abbc452c00d85eb62ecea',
    'dyppzmrda',
    '954181861583172',
    'cgX3BPRlMYnOoJr8xv5AZL-kavk',
  ]

  keys.forEach(async (key, index) => {
    const item = new Key({
      name: key,
      value: values[index],
    })
    await item.save()
  })

  console.log('Done!')
  //   mongoose.disconnect();
}

keysSeeder()
