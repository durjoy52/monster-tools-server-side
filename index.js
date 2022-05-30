const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3empj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect()
        const productCollection = client.db('monster-tools').collection('products')
        const ordersCollection = client.db('monster-tools').collection('orders')
        const reviewCollection = client.db('monster-tools').collection('reviews')
        const userProfileCollection = client.db('monster-tools').collection('userProfile')

        app.post('/orders',async(req,res)=>{
          const orders = req.body
          const result = await ordersCollection.insertOne(orders)
          res.send(result)
        })
        app.post('/review',async(req,res)=>{
          const review= req.body
          const result = await reviewCollection.insertOne(review)
          res.send(result)
        })
        app.get('/review',async(req,res)=>{
          const result = await reviewCollection.find().toArray()
          res.send(result)
        })
        app.get('/products',async(req,res)=>{
            const products = await productCollection.find().toArray()
            res.send(products)
        })
        app.get('/products/:id',async(req,res)=>{
            const id = req.params.id
            const filter = {_id:ObjectId(id)}
            const result = await productCollection.findOne(filter)
            res.send(result)
        })

        app.post('/userProfile',async(req,res)=>{
          const profile = req.body
          const result = await userProfileCollection.insertOne(profile)
          res.send(result)
        })
        app.get('/userProfile/:email',async(req,res)=>{
          const email = req.params.email
          const result = await userProfileCollection.findOne({email:email})
          res.send(result)
        })
    }finally{
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log('Example app listening on port',port)
})