import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import data from './data.json'

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/final-project-backend'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const Product = mongoose.model('Product', {
  title: String,
  info: String,
  price: Number
})

const seedDatabase = async () => {
  await Product.deleteMany()
  data.forEach((product) => new Product(product).save())

  new Product({ title: 'Monstera Deliciosa', info: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Why do we use it? It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.", price: 399 }).save()
  new Product({ title: 'Philodendron Heartleaf', info: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Why do we use it? It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.", price: 99 }).save()
  new Product({ title: 'Zamioculcas Zamiifolia', info: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Why do we use it? It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.", price: 199 }).save()
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

app.get('/products', (req, res) => {

  if (data.length === 0) {
    res.status(404).send('Not found, try again!')
  } else {
    res.json(data)
  }
})

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
