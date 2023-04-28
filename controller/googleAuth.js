require('dotenv').config()
var GoogleStrategy = require('passport-google-oauth20').Strategy
const { Customer } = require('../models/customer')

module.exports = async function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        // console.log("profile: ", profile);
        const existingCustomer = await Customer.findOne({
          email: profile.emails[0].value,
        })
        if (existingCustomer) {
          //   console.log("Customer already exist: ", existingCustomer);
          return done(null, existingCustomer)
        } else {
          const customer = new Customer({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: null,
            phoneNumber: null,
          })
          const result = await customer.save()
          if (result) {
            return done(null, customer)
          } else {
            console.log('Error while creating new customer')
          }
        }
      }
    )
  )
  passport.serializeUser(function (user, done) {
    done(null, user)
  })

  passport.deserializeUser(function (id, done) {
    console.log('Deserialize')
    Customer.findById(id, function (err, customer) {
      done(err, customer)
    })
  })
}
