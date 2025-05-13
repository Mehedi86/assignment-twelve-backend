const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kpht8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // collections
    const biodataCollection = client.db('matrimonySite').collection('biodatas');
    const storyCollection = client.db('matrimonySite').collection('story');
    const favouriteCollection = client.db('matrimonySite').collection('favourites');

    //  get apis

    app.get('/stories', async (req, res) => {
      const cursor = storyCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/biodatas', async (req, res) => {
      const cursor = biodataCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/favourites', async (req, res) => {
      const { email, biodataId } = req.query;
      const result = await favouriteCollection.findOne({
        userEmail: email,
        biodataId: biodataId
      });
      res.send({ isFavorite: !!result });
    });

    // Return full biodata objects that match the user’s favorites
    app.get('/favourites/list', async (req, res) => {
      const { email } = req.query;
      const favorites = await favouriteCollection.find({ userEmail: email }).toArray();

      const ids = favorites.map(fav => fav.biodataId);
      const biodatas = await biodataCollection.find({ biodataId: { $in: ids } }).toArray();

      res.send(biodatas); // ✅ returns array
    });



    // post apis
    app.post('/biodatas', async (req, res) => {
      const biodata = req.body;
      const result = await biodataCollection.insertOne(biodata);
      res.send(result)
    })

    app.post('/favourites', async (req, res) => {
      const { userEmail, biodataId } = req.body;

      // Check if already exists
      const existing = await favouriteCollection.findOne({ userEmail, biodataId });
      if (existing) {
        return res.status(400).send({ message: 'Already favorited' });
      }

      const result = await favouriteCollection.insertOne({ userEmail, biodataId });
      res.send(result);
    });

    // delete apis
    app.delete('/favourites', async (req, res) => {
      const { email, biodataId } = req.query;
      const result = await favouriteCollection.deleteOne({ userEmail: email, biodataId });
      res.send(result);
    });




  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('server is running successfully')
})

app.listen(port, () => {
  console.log('server is running from the port', port)
})

// matrimonySite
// 3HqfeRuZUpQc2Yy0