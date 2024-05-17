const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const { MongoClient } = require('mongodb');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../dist')));

// Serve static files from the 'assets' directory
app.use('/assets', express.static(path.join(__dirname, '../dist/assets')));

// Route for serving the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const server = http.createServer(app);
const io = socketIO(server);

const uri = "mongodb+srv://Vivat:Mantronas3000.@toast-cat.ye9h9zt.mongodb.net/?retryWrites=true&w=majority&appName=toast-cat";
const client = new MongoClient(uri);

let globalCount = 0;
let collection; // Define collection globally

client.connect()
    .then(() => {
        const database = client.db("toast-cat-db");
        collection = database.collection("toast-cat");

        // Fetch the initial global count from MongoDB Atlas
        return collection.findOne();
    })
    .then((result) => {
        if (result) {
            globalCount = result.count;
            console.log("Initial global count:", globalCount);
        } else {
            // Initialize the global count in the database if it doesn't exist
            globalCount = 0;
            collection.insertOne({ count: globalCount });
        }

        // Emit the initial global count to all connected clients
        io.emit('global-count-updated', globalCount);
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB Atlas:", err);
    });

io.on('connection', (socket) => {
    console.log('A client connected');

    // Emit the current global count to the client upon connection
    socket.emit('global-count-updated', globalCount);

    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });

    socket.on('update-global-count', () => {
        // Update global count in the database
        globalCount++;

        // Update the global count in MongoDB Atlas
        collection.updateOne({}, { $set: { count: globalCount } })
            .then(() => {
                console.log("Global count updated:", globalCount);

                // Broadcast the updated count to all connected clients
                io.emit('global-count-updated', globalCount);
            })
            .catch((err) => {
                console.error("Error updating global count in MongoDB Atlas:", err);
            });
    });
});

// Listen for server events
server.listen(process.env.PORT || 3000, () => {
    console.log('App available on http://localhost:3000');
});
