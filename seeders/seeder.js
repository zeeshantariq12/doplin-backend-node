require('dotenv').config({ path: '../.env' })

const mongoose = require('mongoose')
const { SuperAdmin } = require('../models/superAdmin')
const { Role } = require('../models/roles')
const { Category } = require('../models/category')
const { Language } = require('../models/language')

const bcryptjs = require('bcryptjs')

const seeder = async () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB...'))
    .catch((err) => console.error('Could not connect to MongoDb... ', err))

  const languages = ['English', 'French']
  const codes = ['en-US', 'fr']

  const roles = ['Super admin', 'Shop']
  const categoriesEn = ['Electronics', 'Kitchen']
  const categoriesFr = ['électronique', 'cuisine']

  const category_images = [
    'https://res.cloudinary.com/dyppzmrda/image/upload/v1655794565/ticcwruqw97891jznlt6.jpg',
    'https://res.cloudinary.com/dyppzmrda/image/upload/v1656583062/image_0000000000001_idtcr5.webp',
  ]
  languages.map(async (language, index) => {
    const ln = new Language({
      name: language,
      code: codes[index],
    })
    await ln.save()
  })
  console.log('lanuages added')
  roles.map(async (item, index) => {
    const role = new Role({ name: item })
    await role.save()
  })
  let en, fr
  categoriesEn.map(async (name, index) => {
    en = name
    fr = categoriesFr[index]
    const category = new Category({
      name: { 'en-US': en, fr },
      imageUrl: category_images[index],
    })

    await category.save()
  })

  const adminRole = await Role.findOne({ name: 'Super admin' })

  const hashedPw = await bcryptjs.hash('12345678', 12)
  const superAdmin = new SuperAdmin({
    name: 'The Hexaa',
    email: 'admin@admin.com',
    password: hashedPw,
    role: adminRole._id,
  })

  await superAdmin.save()
}

seeder()
