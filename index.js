const express = require('express')
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ObjectId } = require('mongodb');
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const port = 5500;
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("doctors"));
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ppwsz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log(err)
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
  const bookingCollection = client.db(`${process.env.DB_NAME}`).collection("books")

  app.get('/booking-lists', (req, res) => {
  
    bookingCollection.find({email: req.query.email})
    .toArray((err, booking) => {

      res.send(booking)
    })
    })

  app.get('/order-lists', (req, res) => {
    bookingCollection.find({})
    .toArray((err, document) => 
      res.send(document)
    )

  })

  app.put('/order-lists', (req, res) => {
    
      const id = new ObjectID(req.query.id)
      const status = req.query.status
    bookingCollection.findOneAndUpdate({_id: id}, {$set: {bookingStatus: status}})
    .then(result => {
      res.send(result)
    })

  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email
 
    adminCollection.find({email: email})
    .toArray((err , documents) => {
      if(err){
        console.log(err)
      }
      res.send(documents)
     
    })
  })
  app.post('/addAdmin', (req, res) => {
    const email = req.body
    adminCollection.insertOne(email)
    .then(result => {
      res.send(result.acknowledged)
    })
  })

  app.post('/addBook', (req, res) => {
    const book = req.body;
    bookingCollection.insertOne(book)
    .then(result => {
      res.send(result.acknowledged)
    })

  })

  app.get('/service/:id', (req, res) => {
    const id = ObjectId(req.params.id);
    serviceCollection.findOne({_id: id})  
      .then(result =>  {
        const id = result._id;
        const title = result.title;
        const price = result.price;
        const description = result.description
        res.send({id, title, price, description})
      })
  })
  app.get('/services', (req, res) => {
    serviceCollection.find({})
    .toArray((err, documents) => {
      
      res.send(documents)
    })
  })

  app.delete('/delete-service/:id', (req, res) => {
    const id = ObjectId(req.params.id);
    serviceCollection.findOneAndDelete({_id: id})
    .then(result => {
       if(result){
         res.send(true)
       }else{
         res.send(false)
       }
      
    })
  })

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;
        const newImg = file.data;
        const encImg = newImg.toString("base64")

        const image = {
          contentType : file.mimetype,
          size : file.size,
          img: Buffer.from(encImg, 'base64')
        }
        serviceCollection.insertOne({title, price, description, image})
        .then(result => {
          res.send(result)
        })
    })

  app.get('/review' , (req, res) => {
    reviewCollection.find({})
    .toArray((err, documents) => {
      console.log(err)
      res.send(documents)
    })
  })

  app.post('/addReview', (req, res) => {
    const review = req.body
     reviewCollection.insertOne(review)
     .then(result => {
        res.send(result)
     })
  })
//   client.close();
});

 

app.get('/', (req, res) => {
  res.send('Hello World I Im connected!')
})

app.listen(process.env.PORT || port);