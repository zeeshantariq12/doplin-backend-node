const { statusCode } = require('http-status-codes')
module.exports = (req, res, next) => {
  //   console.log(req.user.role.name);
  if (req.user.role.name === 'Super admin') {
    //  return res.status(statusCode.)
    next()
  } else {
    return res
      .status(401)
      .send({ error: 'Only the Super Admin can perform this action.' })
  }
}
