const getRooms = require('../utils/getRooms');
const newRoom = require('../utils/newRoom');
const writeRooms = require('../utils/writeRooms');
const loadTemplate = require('../utils/loadTemplate');

const sendRoomMessage = require('./sendRoomMessage');
const loadMessageEvent = require('./loadMessageEvent');
const loadDisconnectEvent = require('./loadDisconnectEvent');
const loadGameEvents = require('./loadGameEvents');

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

        const usersLength = rooms[room].users.length;

        if (usersLength > process.env.ROOM_MAX_USERS) {
            socket.emit('auth-fail', { message: `Room is full (max ${process.env.ROOM_MAX_USERS} users allowed)` });
            return;
        }

        const userToAdd = { id: socket.id, name: user.name, vote: '', voted: false, leader: usersLength == 0 };
        rooms[room].users.push(userToAdd);
        userMap[socket.id] = room
        socket.join(room)

        socket.emit('auth-success', {
            user: userToAdd,
            message: 'user authenticated',
            room: rooms[room],
            chatTemplate: loadTemplate('chatRoom'),
            gameTemplate: loadTemplate('pokerRoom')
        });

        let enteredMessage = {
            type: 'status',
            message: `User ${user.name} has entered the room`
        }

        rooms[room].messages.push(enteredMessage)
        writeRooms(rooms);
        sendRoomMessage(io, room, enteredMessage);
        io.to(room).emit('user-new', rooms[room]);

        loadMessageEvent(socket, io)

        loadDisconnectEvent(socket, io, userMap)

        loadGameEvents(socket, io, userMap)
    });
}