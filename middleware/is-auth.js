const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization')

  if (!authHeader) {
    return res.status(401).send({ error: 'Not Authanticated' })
  }
  const token = authHeader.split(' ')[1]

  let decodedUser
  try {
    decodedUser = jwt.verify(token, process.env.SUPER_KEY)
  } catch (err) {
    err.statusCode = 500
    throw err
  }
  if (!decodedUser) {
    return res.status(401).send({ error: 'Not Authanticated' })
  }
  req.user = decodedUser
  next()
}
