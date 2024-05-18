const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const admin = require('firebase-admin');

const serviceAccount = require('./cat-db-settings.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://toast-cat-db-default-rtdb.europe-west1.firebasedatabase.app"
});

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, './dist')));

// Serve static files from the 'assets' directory
app.use('/assets', express.static(path.join(__dirname, './dist/assets')));

// Route for serving the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/index.html'));
});

const server = http.createServer(app);
const io = socketIO(server, { cors: "*" });

const db = admin.database();
const countRef = db.ref('GlobalCount');

let globalCount = 0;

countRef.once('value', (snapshot) => {
  const data = snapshot.val();
  if (data !== null && typeof data === 'object' && 'GlobalCount' in data) {
    globalCount = data.GlobalCount;
    console.log("Initial global count:", globalCount);
  } else {
    // Initialize the global count in the database if it doesn't exist
    countRef.set({ GlobalCount: globalCount });
  }

  // Emit the initial global count to all connected clients
  io.emit('global-count-updated', globalCount);
})
.catch((err) => {
  console.error("Error initializing global count:", err);
  // Handle the error gracefully, e.g., by setting a default value for globalCount
  globalCount = 0;
  io.emit('global-count-updated', globalCount);
});

io.on('connection', (socket) => {
  console.log('A client connected');

  // Emit the current global count to the client upon connection
  socket.emit('global-count-updated', globalCount);

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });

  socket.on('update-global-count', () => {
    globalCount++;

    // Update the global count in Realtime Database
    countRef.update({ GlobalCount: globalCount })
      .then(() => {
        console.log("Global count updated:", globalCount);

        // Broadcast the updated count to all connected clients
        io.emit('global-count-updated', globalCount);
      })
      .catch((err) => {
        console.error("Error updating global count:", err);
      });
  });
});

// Listen for server events
server.listen(process.env.PORT || 3000, () => {
  console.log('App available on http://localhost:3000');
});
