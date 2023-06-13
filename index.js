const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kfqicaj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const campDataCollection = client.db("summerCamp").collection("campdata");
    const usersCollection = client.db("summerCamp").collection("users");
    const selectedClassCollection = client.db("summerCamp").collection("selectedclass");

    app.get('/campdata', async (req, res) => {
      const cursor = campDataCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    // users related task
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);
      
 
      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // selected classes related 

    app.get('/selectedclass', async (req, res) => {
      const email = req.query.email;
      console.log(email)
  

      if (!email) {
       res.send([]);
      }

      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ error: true, message: 'forbidden access' })
      // }

      const query = { email: email };
      const result = await selectedClassCollection.find(query).toArray();
      res.send(result);
      
    });

    app.post('/selectedclass', async (req, res) => {
      const item = req.body;
      const result = await selectedClassCollection.insertOne(item);
      res.send(result);
    })

    app.delete('/selectedclass/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassCollection.deleteOne(query);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Summer Camp is running')
  })
  
  app.listen(port, () => {
    console.log(`Summer Camp is running on port ${port}`)
  })