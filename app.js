const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '/public')));

// Serve static files from the 'assets' directory
app.use('/assets', express.static(path.join(__dirname, './public/assets')));

// Route for serving the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

const server = http.createServer(app);
const io = socketIO(server);

let globalCount = 0;

fs.readFile(path.join(__dirname, 'globalCount.json'), 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading global count file:", err);
    } else {
        const jsonData = JSON.parse(data);
        globalCount = jsonData.count;
        console.log("Initial global count:", globalCount);

        io.emit('global-count-updated', globalCount);
    }
});

io.on('connection', (socket) => {
    console.log('A client connected');

    io.emit('global-count-updated', globalCount);

    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });

    socket.on('update-global-count', (data) => {
        // Update global count
        globalCount++;

        // Write the updated count to the JSON file
        const newData = { count: globalCount };
        fs.writeFile(path.join(__dirname, 'globalCount.json'), JSON.stringify(newData), 'utf8', (err) => {
            if (err) {
                console.error("Error writing global count to file:", err);
            } else {
                console.log("Global count updated:", globalCount);

                // Broadcast the updated count to all connected clients
                io.emit('global-count-updated', globalCount);
            }
        });
    });
});

// Listen for server events
server.listen(process.env.PORT || 3000, () => {
    console.log('App available on http://localhost:3000');
});
