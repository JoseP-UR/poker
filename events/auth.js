const getRooms = require('../utils/getRooms');
const newRoom = require('../utils/newRoom');
const writeRooms = require('../utils/writeRooms');
const loadTemplate = require('../utils/loadTemplate');

const sendRoomMessage = require('./sendRoomMessage');
const chatMessageEvent = require('./chatMessageEvent');
const roomDisconnect = require('./roomDisconnect');

module.exports = (socket, io, userMap) => {
    socket.on('auth', (user) => {
        let rooms = getRooms();
        const { room, pwd } = user;

        if (!rooms[room]) {
            rooms[room] = newRoom(pwd);
            writeRooms(rooms);
        }

        if (rooms[room].pwd != pwd) {
            socket.emit('auth-fail', { message: "Wrong password" });
            return;
        }

        userExists = rooms[room].users.filter(u => {
            return u.name == user.name
        }).length;

        if (userExists) {
            socket.emit('auth-fail', { message: "There's already a user in the room with this name" });
            return;
        }

        if (rooms[room].users.length > process.env.ROOM_MAX_USERS) {
            socket.emit('auth-fail', { message: `Room is full (max ${process.env.ROOM_MAX_USERS} users allowed)` });
            return;
        }

        rooms[room].users.push({ id: socket.id, name: user.name });
        userMap[socket.id] = room
        socket.join(room)

        socket.emit('auth-success', {
            message: 'user authenticated',
            room: rooms[room],
            template: loadTemplate('chatRoom')
        });

        let enteredMessage = {
            type: 'status',
            message: `User ${user.name} has entered the room`
        }

        rooms[room].messages.push(enteredMessage)
        writeRooms(rooms);
        sendRoomMessage(io, room, enteredMessage);
        io.to(room).emit('user-new', rooms[room]);

        chatMessageEvent(socket, io)

        roomDisconnect(socket, io, userMap)
    });
}