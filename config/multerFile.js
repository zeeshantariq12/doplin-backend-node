const multer = require('multer')
const path = require('path')

module.exports = function () {
  const fileStorage = multer.diskStorage({
    destination: `uploads`, // Destination to store images
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + '_' + Date.now() + path.extname(file.originalname)
      )
    },
  })

  const fileUpload = multer({
    storage: fileStorage,

    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(xlsx)$/)) {
        return cb(new Error('Please upload Excel File'))
      }
      cb(undefined, true)
    },
  })
  return fileUpload
}
