const express = require('express')
const cloudinary = require('cloudinary').v2
const path = require('path')

const { Server } = require('socket.io')
const { Key } = require('./models/key')

require('dotenv').config()
require('./config/db')()
const app = express()

const configureCloudinary = async () => {
  const cloud_name = await Key.findOne({ name: 'CLOUDINARY_CLOUD_NAME' })
  const api_key = await Key.findOne({ name: 'CLOUDINARY_API_KEY' })
  const api_secret = await Key.findOne({ name: 'CLOUDINARY_API_SECRET' })
  cloudinary.config({
    cloud_name: cloud_name.value,
    api_key: api_key.value,
    api_secret: api_secret.value,
  })
}
configureCloudinary()

require('./config/morgan')(app)
require('./config/routes')(app)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
  res.send('Amazon Clone Working!')
})

const port = parseInt(process.env.PORT) || 5006

const server = app.listen(port, () => console.log(`server started at ${port}`))

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})

io.on('connection', (socket) => {
  console.log('User connected')
  socket.emit('connection', { message: 'Client connected' })
})

app.set('socketio', io)
