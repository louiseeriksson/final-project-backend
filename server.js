import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import data from './data.json'

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/final-project-backend'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const Product = mongoose.model('Product', {
  // id: Number, 
  // img: String, 
  title: String,
  info: String,
  price: Number,
  //isFeatured: Boolean
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

app.get('/', (req, res) => {
  res.send('Hello world')
})

// All products
// 1: hämta flera produkter
app.get('/products', (req, res) => {

  // hämta produkter typ Product.findOne({ title: req.params.title }).then(product => {
  Product.find(req.query)

  if (data.length === 0) {
    res.status(404).send('Not found, try again!')
  } else {
    res.json(data)
  }
})

// 2: hämta enskild produkt
// /products/:id

// Find by title

app.get('/products/title/:title', (req, res) => {

  Product.findOne({ title: req.params.title }).then(product => {
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
