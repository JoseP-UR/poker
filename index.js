require('dotenv').config();
process.env.dir = __dirname;
const express = require('express');
const app = express();
const { staticRoutes } = require('./routes');

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const loadEvents = require('./loadEvents');
const loadTemplate = require('./utils/loadTemplate');

let userMap = {};

staticRoutes(app);

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);
    socket.emit('socket-connected', { id: socket.id, loginTemplate: loadTemplate('authForm') });
    loadEvents(socket, io, userMap);
});

server.listen(process.env.APP_PORT, () => {
    console.log(`listening on http://localhost:${process.env.APP_PORT}`);
});