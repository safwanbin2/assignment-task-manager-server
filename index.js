const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mogpxeu.mongodb.net/?retryWrites=true&w=majority`;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("task manager server is runnig fine")
});

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
        client.connect();
        console.log(`successfully connected mongoDB`);
    } catch (error) {
        console.log('Problem connecting mongoDB -');
    }
}
run();

// db collections 
const TaskCollection = client.db('taskManager').collection('tasks');

// adding new tasks
app.post('/tasks', async (req, res) => {
    try {
        const newTask = req.body;
        const result = await TaskCollection.insertOne(newTask);
        res.send(result);
    } catch (error) {
        console.log(error);
    }
})
// getting all the undone / pending tasks
app.get('/tasks', async (req, res) => {
    try {
        const filter = req.query.filter;
        if (filter === "done") {
            const result = (await TaskCollection.find({ isDone: true }).toArray()).reverse();
            return res.send(result);
        }
        else if (filter === "undone") {
            const result = (await TaskCollection.find({ isDone: false }).toArray()).reverse();
            return res.send(result);
        }
        else {
            const result = (await TaskCollection.find({}).toArray()).reverse();
            return res.send(result);
        }
    } catch (error) {
        console.log(error);
    }
})
// updating read status
app.patch('/tasks', async (req, res) => {
    try {
        const id = req.query.id;
        const decision = req.query.isDone;
        const updateDocument = {
            $set: {
                isDone: JSON.parse(decision)
            }
        };
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const result = await TaskCollection.updateOne(filter, updateDocument, options);
        res.send(result)
    } catch (error) {
        console.log(error);
    }
})
// deleting id specific task
app.delete('/tasks', async (req, res) => {
    try {
        const id = req.query.id;
        const filter = { _id: new ObjectId(id) };
        const result = await TaskCollection.deleteOne(filter);
        res.send(result);
    } catch (error) {
        console.log(error);
    }
})

app.listen(port, () => {
    console.log(`server is running on ${port}`);
})