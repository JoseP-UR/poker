require('dotenv').config();
process.env.dir = __dirname;
const express = require('express');
const app = express();
const routes = require('./routes');

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { readFileSync, writeFileSync } = require('fs');
const newRoom = require('./helpers/newRoom');

let userMap = {};

routes(app);

function getRooms() {
    return JSON.parse(readFileSync('./rooms.json'))
}

io.on('connection', (socket) => {
    console.log(socket.id);
    console.log('connection');

    socket.on('auth', (user) => {
        let rooms = getRooms();
        console.log(user);
        const {room, pwd} = user;

        if (!rooms[room]) {
            console.log('creating room from auth');
            rooms[room] = newRoom(pwd);
            console.log(rooms);
            writeFileSync('./rooms.json', JSON.stringify(rooms));
        }

        userExists = rooms[room].users.filter(u => {
            return u.name == user.name
        }).length;
        
        if (userExists) {
            socket.emit('auth-fail', {message: "There's already a user with this name"});
            return;
        }

        rooms[room].users.push({id: socket.id, name: user.name});
        writeFileSync('./rooms.json', JSON.stringify(rooms));
        socket.join(room)
        socket.emit('auth-success', {
            message: 'user authenticated', 
            room: rooms[room],
            template: readFileSync('./views/templates/chatRoom.html', {encoding: 'utf-8'})
        });
        io.to(room).emit('new-user', user.name);


        socket.on('chat-message', data => {
            const {room, pwd, user, message} = data;

            io.to(room).emit('chat-message', {user, message})
        })

        socket.on('disconnect', () => {
            console.log('user disconnected');
            console.log(socket.id);
            let rooms = getRooms();

         });
    });

});

server.listen(3001, () => {
    console.log('listening on http://localhost:3001');
});