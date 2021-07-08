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
        const {room, pwd} = user;

        if (!rooms[room]) {
            rooms[room] = newRoom(pwd);
            console.log(rooms);
            writeFileSync('./rooms.json', JSON.stringify(rooms));
        }

        if (rooms[room].pwd != pwd) {
            socket.emit('auth-fail', {message: "Wrong password"});
            return;
        }

        userExists = rooms[room].users.filter(u => {
            return u.name == user.name
        }).length;
        
        if (userExists) {
            socket.emit('auth-fail', {message: "There's already a user with this name"});
            return;
        }

        if (rooms[room].users.length > process.env.ROOM_MAX_USERS) {
            socket.emit('auth-fail', {message: "Room is full"});
            return;
        }

        rooms[room].users.push({id: socket.id, name: user.name});
        userMap[socket.id] = room
        socket.join(room)
        socket.emit('auth-success', {
            message: 'user authenticated', 
            room: rooms[room],
            template: readFileSync('./views/templates/chatRoom.html', {encoding: 'utf-8'})
        });

        let enteredMessage = { 
            type: 'status',
            message: `User ${user.name} has entered the room`
        }

        rooms[room].messages.push(enteredMessage)
        writeFileSync('./rooms.json', JSON.stringify(rooms));
        io.to(room).emit('chat-message', enteredMessage);
        io.to(room).emit('user-new', rooms[room]);


        socket.on('chat-message', data => {
            const {room, pwd, user, message} = data;
            let rooms = getRooms();
            const chatMessage = {
                type: 'user',
                user,
                message
            }
            rooms[room].messages.push(chatMessage)
            writeFileSync('./rooms.json', JSON.stringify(rooms));

            io.to(room).emit('chat-message', chatMessage)
        })

        socket.on('disconnect', () => {
            let rooms = getRooms();
            let room = userMap[socket.id] 

            user = rooms[room].users.filter(u => {
                return u.id == socket.id;
            })[0];

            rooms[room].users = rooms[room].users.filter(u => {
                return u.id != socket.id;
            })

            let disconnectMessage = {
                type: 'status',
                message: `${user.name} has disconnected`
            };

            rooms[room].messages.push(disconnectMessage)

            writeFileSync('./rooms.json', JSON.stringify(rooms));
            io.to(room).emit('chat-message', disconnectMessage);
            io.to(room).emit('user-disconnect', rooms[room]);
            delete userMap[socket.id];
         });
    });

});

server.listen(process.env.APP_PORT, () => {
    console.log(`listening on http://localhost:${process.env.APP_PORT}`);
});