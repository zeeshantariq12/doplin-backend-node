const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')

const superAdminRoutes = require('../routes/superAdmin')
const authRoutes = require('../routes/auth')
const shopRoutes = require('../routes/shop')
const publicRoutes = require('../routes/publicRoutes')
const customerRoutes = require('../routes/customer')

module.exports = function (app) {
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  )
  app.use(cors())

  app.use('/api', publicRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/admin', superAdminRoutes)
  app.use('/api/shop', shopRoutes)
  app.use('/api/customer', customerRoutes)
}
