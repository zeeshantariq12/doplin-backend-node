const DistanceCalculator = require('distance-calculator-js')

const { Category } = require('../models/category')
const { Product } = require('../models/product')
const { Rating } = require('../models/rating')
const { Shop } = require('../models/shop')
const { Language } = require('../models/language')
const { Review } = require('../models/review')

exports.getCategories = async (req, res, next) => {
  try {
    const { ln } = req.params
    const categories = await Category.find()

    const catgr = categories.map((category) => {
      let ctegoryName = category.name.get(ln)
      if (ctegoryName == '') {
        ctegoryName = category.name.get('en-US')
      }
      return {
        ...category._doc,
        name: ctegoryName,
      }
    })

    res.status(200).send({
      categories: catgr,
    })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.getProducts = async (req, res, next) => {
  try {
    const { ln, categoryId } = req.params
    const { latitude, longitude } = req.body
    const currentPage = parseInt(req.query.page) || 1
    const perPage = parseInt(req.query.limit) || 10

    const category = await Category.findById(categoryId)
    let totalItems = await Product.find({
      category: categoryId,
    }).countDocuments()

    const products = await Product.find({ category: categoryId })
      .select('-retailPrice')
      .populate('creator')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)

    const prods = await Promise.all(
      products.map(async (product) => {
        const rating = await getRatings(product._id)

        let productName = product.name.get(ln)
        let productDescription = product.description.get(ln)
        let productFeatures = product.features.get(ln)

        if (productName == '') {
          productName = product.name.get('en-US')
        }
        if (productDescription == '') {
          productDescription = product.description.get('en-US')
        }
        if (productFeatures == '') {
          productFeatures = product.features.get('en-US')
        }
        const shop = {
          _id: product.creator._id,
          name: product.creator.name,
          email: product.creator.email,
        }
        if (!latitude || !longitude) {
          return {
            ...product._doc,
            name: productName,
            description: productFeatures,
            features: productFeatures,
            creator: shop,
            rating,
          }
        } else {
          const distance = calcDist(
            product.creator.latitude,
            product.creator.longitude,
            latitude,
            longitude
          )
          //distance less than or equal to 7Km
          if (distance <= 7) {
            return {
              ...product._doc,
              name: productName,
              description: productFeatures,
              features: productFeatures,
              creator: product.creator._id,
              rating,
              distance,
            }
          }
        }
      })
    )
    const fetchedProducts = prods.filter((product) => {
      return product
    })

    res.status(200).send({
      category: category.name.get(ln),
      products: fetchedProducts,
      totalpages: Math.ceil(totalItems / perPage),
    })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.changeNames = async (req, res, next) => {
  try {
    const { ln } = req.params
    const { products } = req.body
    const productData = await Promise.all(
      products.map(async (prod) => {
        return await Product.findById({ _id: prod._id }).select(
          '-quantity -retailPrice'
        )
      })
    )
    const prods = productData.map((product) => {
      let productName = product.name.get(ln)
      let productDescription = product.description.get(ln)
      let productFeatures = product.features.get(ln)

      if (productName == '') {
        productName = product.name.get('en-US')
      }
      if (productDescription == '') {
        productDescription = product.description.get('en-US')
      }
      if (productFeatures == '') {
        productFeatures = product.features.get('en-US')
      }
      return {
        ...product._doc,
        name: productName,
        description: productFeatures,
        features: productFeatures,
      }
    })

    return res.status(200).send({ products: prods })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.getShop = async (req, res, next) => {
  try {
    const shopId = req.params.shopId
    const shop = await Shop.findById(shopId).select('-password -role')
    if (!shop) {
      return res.status(404).send('Could not find Shop')
    }
    res.status(200).json({ message: 'Shop fetched.', shop: shop })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.getProduct = async (req, res, next) => {
  try {
    const { ln, productId } = req.params

    const product = await Product.findById(productId)
      .select('-retailPrice')
      .populate('creator', 'name email')
    if (!product) {
      return res.status(404).send({ error: 'Could not find Product.' })
    }

    let productName = product.name.get(ln)
    let productDescription = product.description.get(ln)
    let productFeatures = product.features.get(ln)

    if (productName == '') {
      productName = product.name.get('en-US')
    }
    if (productDescription == '') {
      productDescription = product.description.get('en-US')
    }
    if (productFeatures == '') {
      productFeatures = product.features.get('en-US')
    }
    const rating = await getRatings(productId)

    let fetchedProduct = {
      ...product._doc,
      name: productName,
      description: productFeatures,
      features: productFeatures,
      rating,
    }

    res
      .status(200)
      .json({ message: 'Product fetched.', product: fetchedProduct })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.search = async (req, res, next) => {
  try {
    const { ln } = req.params
    const { productName, latitude, longitude } = req.body

    const name = `name.${ln}`

    let products = await Product.find(
      {
        [name]: { $regex: '.*' + productName + '.*', $options: 'i' },
      },
      { name: 1, creator: 1 }
    ).populate('creator')

    const results = products.map((product) => {
      const distance = calcDist(
        product.creator.latitude,
        product.creator.longitude,
        latitude,
        longitude
      )
      if (distance <= 7) {
        return {
          _id: product._id,
          name: product.name.get(ln),
          distance,
        }
      }
    })
    const fetchedProducts = results.filter((product) => {
      return product
    })
    return res.status(200).send({ products: fetchedProducts })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.getLanguages = async (req, res, next) => {
  try {
    const languages = await Language.find()
    return res.status(200).send({ languages: languages })
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

exports.getReviews = async (req, res, next) => {
  try {
    const { ln, product } = req.params
    const currentPage = parseInt(req.query.page) || 1
    const perPage = parseInt(req.query.limit) || 5

    const productDetails = await Product.findById(product)
    let productName = productDetails.name.get(ln)
    if (productName == '') {
      productName = productDetails.name.get('en-US')
    }

    let totalReviews = await Review.find({
      product: product,
    }).countDocuments()

    const reviews = await Review.find({ product: product })
      .populate('product customer')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
    const reviewsData = reviews.map((review) => {
      return {
        _id: review._id,
        customer: review.customer.name,
        comment: review.comment,
      }
    })
    if (reviews) {
      return res.status(200).send({
        product: productName,
        reviewsData,
        totalpages: Math.ceil(totalReviews / perPage),
      })
    }
  } catch (err) {
    res.status(500).send({ error: err })
  }
}

const getRatings = async (productId) => {
  const ratings = await Rating.find({
    product: productId,
  })

  const ratingsSum = ratings.reduce(function (total, currentValue) {
    return total + currentValue.rating
  }, 0)

  const average = ratingsSum / ratings.length
  return { totalRatings: ratings.length, avg: average }
}

const calcDist = (lat1, lon1, lat2, lon2) => {
  const shop = { lat: lat1, long: lon1 }
  const user = { lat: lat2, long: lon2 }
  const d = DistanceCalculator.calculate(shop, user, 'km')
  return d
}
