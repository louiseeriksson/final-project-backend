import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import crypto from 'crypto'
import bcrypt from 'bcrypt-nodejs'
import data from './data.json'
import dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import multer from 'multer'
import cloudinaryStorage from 'multer-storage-cloudinary'

dotenv.config()

cloudinary.config({
  cloud_name: 'louiseeriksson',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = cloudinaryStorage({
  cloudinary,
  folder: 'products',
  allowedFormats: ['jpg', 'png'],
  transformation: [{ width: 500, height: 500, crop: 'limit' }]
})

const parser = multer({ storage })


const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/final-project-backend'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const User = mongoose.model('User', {
  name: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
})

const Product = mongoose.model('Product', {
  id: Number,
  img: String,
  title: String,
  altName: String,
  info: String,
  price: Number,
  isFeatured: Boolean
})

const seedDatabase = async () => {
  await Product.deleteMany()
  data.forEach((product) => new Product(product).save())
}

seedDatabase()

const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(bodyParser.json())

const authenticateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ accessToken: req.header('Authorization') })
    console.log(req.header('Authorization'))

    if (user) {
      req.user = user
      next()
    } else {
      res.status(401).json({ loggedOut: true, message: "Please try logging in again" })
    }
  } catch (err) {
    res
      .status(403)
      .json({ message: 'access token is missing or wrong', errors: err.errors })
  }
}

app.get('/', (req, res) => {
  res.send('Hello world')
})

// cloudinary images
app.post('/products', parser.single('image'), async (req, res) => {
  req.send('Yay, uploaded!')
})

// login
app.get('/login', (req, res) => {
  res.send('hello login')
})

app.get('/users', async (req, res) => {
  const users = await User.find()
  res.json(users)
})

app.post('/users', async (req, res) => {
  try {
    const { name, password } = req.body
    const user = new User({ name, password: bcrypt.hashSync(password) })
    const saved = await user.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: 'Could not save user 1', errors: err.errors })
  }
})

app.get('/secrets', authenticateUser)
app.get('/secrets', (req, res) => {
  res.json({ secret: 'this is a secret message!' })
})

app.get('/users/:id', authenticateUser)
app.get('/users/:id', (req, res) => {
  try {
    res.status(201).json(req.user)
  } catch (err) {
    res.status(400).json({ message: 'could not save user 2', errors: err.errors })
  }
})

app.post('/sessions', async (req, res) => {
  const user = await User.findOne({ name: req.body.name })

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.json({ userId: user._id, name: user.name, accessToken: user.accessToken })
  } else {
    res.json({ notFound: true })
  }
})

// All products
app.get('/products', (req, res) => {

  // hämta produkter typ Product.findOne({ title: req.params.title }).then(product => {
  Product.find(req.query)

  if (data.length === 0) {
    res.status(404).send('Not found, try again!')
  } else {
    res.json(data)
  }
})


// Find by id
app.get('/products/:id', (req, res) => {

  Product.findOne({ id: req.params.id }).then(product => {
    if (product) {
      res.json(product)
    } else {
      res.status(404).json({ error: 'Product not found, try again!' })
    }
  })
})

// Find by price
app.get('/products/price/:price', (req, res) => {

  Product.find({ price: req.params.price }).then(product => {
    if (product) {
      res.json(product)
    } else {
      res.status(404).json({ error: 'Product not found!' })
    }
  })
})

//Featured products ??
// app.get('/products/featured', (req, res) => {

//   Product.find(req.query.isFeatured)

//   if (data.length === 0) {
//     res.status(404).send('Not found, try again!')
//   } else {
//     res.json(data)
//   }
// })

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
