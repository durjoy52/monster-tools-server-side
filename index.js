const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors');
require('dotenv').config()
var jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000

// middleware 
app.use(cors())
app.use(express.json())

const verifyJWT=(req,res,next)=>{
  const authHeader = req.headers.authorization
  if(!authHeader){
    return res.status(401).send({message:'UnAuthorized access'})
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
    if(err){
      return res.status(403).send({message:'Forbidden access'})
    }
    req.decoded = decoded
    next()
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3empj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        await client.connect()
        const productCollection = client.db('monster-tools').collection('products')
        const ordersCollection = client.db('monster-tools').collection('orders')
        const reviewCollection = client.db('monster-tools').collection('reviews')
        const userProfileCollection = client.db('monster-tools').collection('userProfile')
        const userCollection = client.db('monster-tools').collection('users')

        app.put('/orders/:email',async(req,res)=>{
          const email = req.params.email
          const orders = req.body
          const filter = {email:email}
          const options = {upsert:true}
          const updateDoc={
            $set:orders
          }
          const result = await ordersCollection.updateOne(filter,updateDoc,options)
          res.send(result)
        })
        app.get('/orders/:email',verifyJWT,async(req,res)=>{
          const email = req.params.email;
          const filter = {email:email}
          const result = await ordersCollection.find(filter).toArray()
          res.send(result)
        })
        
        app.post('/reviews',async(req,res)=>{
          const review= req.body
          const result = await reviewCollection.insertOne(review)
          res.send(result)
        })
        app.get('/review',verifyJWT,async(req,res)=>{
          const result = await reviewCollection.find().toArray()
          res.send(result)
        })
        app.put('/product/:id',async(req,res)=>{
          const id = req.params.id
          const filter = {_id:ObjectId(id)}
          const updateData = req.body
          console.log(updateData)
          const options = {upsert:true}
          const updatedDoc = {
            $set:{
              available_quantity: updateData.available_quantity
            }
          }
          const result = await productCollection.updateOne(filter,updatedDoc,options)
          res.send(result)
        })
        app.get('/products',async(req,res)=>{
            const products = await productCollection.find().toArray()
            res.send(products)
        })
        app.post('/products',async(req,res)=>{
          const product= req.body
          const result = await productCollection.insertOne(product)
          res.send(result)
        })
        app.get('/products/:id',verifyJWT,async(req,res)=>{
            const id = req.params.id
            const filter = {_id:ObjectId(id)}
            const result = await productCollection.findOne(filter)
            res.send(result)
        })

        app.put('/userProfile/:email',async(req,res)=>{
         const email = req.params.email
         const user = req.body
         const filter = {email:email}
         const options = {upsert:true}
         const updatedDoc ={
           $set:user
         }
         const result = await userProfileCollection.updateOne(filter,updatedDoc,options)
          res.send(result)
        })
        app.get('/userProfile/:email',verifyJWT,verifyJWT,async(req,res)=>{
          const email = req.params.email
          const result = await userProfileCollection.findOne({email:email})
          res.send(result)
        })

        app.delete('/user/:email',verifyJWT,async(req,res)=>{
          const email = req.params.email;
          const filter = {email:email}
          const result = await userCollection.deleteOne(filter)
          res.send(result)
        })
        app.put('/users/:email',async(req,res)=>{
          const email = req.params.email
          const user = req.body
          const filter ={email:email}
          const options= {upsert:true}
          const updateDoc = {
            $set:user
          }
          const result = await userCollection.updateOne(filter,updateDoc,options)
          const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
          res.send({result,token})
        })
        app.get('/admin/:email',verifyJWT,async(req,res)=>{
          const email = req.params.email;
          const user = await userCollection.findOne({email:email})
          const isAdmin = user.role === 'admin'
          res.send({admin:isAdmin})
        })
        app.put('/users/admin/:email',verifyJWT,async(req,res)=>{
          const email = req.params.email
          const requester = req.decoded.email;
          const requesterAccount = await userCollection.findOne({email:requester})
          if(requesterAccount.role === 'Admin'){
            const filter ={email:email}
            const updateDoc = {
              $set:{role:'admin'}
            }
            const result = await userCollection.updateOne(filter,updateDoc)
            const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
            res.send({result,token})
          }else{
            res.status(403).send({message:'forbidden'})
          }
          
        })
        app.get('/users',async(req,res)=>{
          const result = await userCollection.find().toArray()
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