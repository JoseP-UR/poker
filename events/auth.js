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

        chatMessageEvent(socket, io)

        roomDisconnect(socket, io, userMap)

        socket.on('user-vote', data => {
            let rooms = getRooms();

            let room = userMap[socket.id];

            rooms[room].users =rooms[room].users.map(u => {
                if (u.id != socket.id) {
                    return u
                }

                return {...u, vote: data.vote, voted: true}
            })

            writeRooms(rooms);
            io.to(room).emit('user-vote', rooms[room]);
        });

        socket.on('result-reveal', data => {
            let rooms = getRooms();

            let room = userMap[socket.id];

            user = rooms[room].users.filter(u => {
                return u.id == socket.id;
            })[0];

            if (!user.leader) {
                socket.emit('auth-fail', {message: 'Only the leader can reveal the votes'})
                return;
            }

            rooms[room].revealed = true;
            writeRooms(rooms);
            io.to(room).emit('result-reveal', rooms[room]);
        })

        socket.on('result-reset', data => {
            let rooms = getRooms();

            let room = userMap[socket.id];

            user = rooms[room].users.filter(u => {
                return u.id == socket.id;
            })[0];

            if (!user.leader) {
                socket.emit('auth-fail', {message: 'Only the leader can reset the votes'})
                return;
            }

            rooms[room].revealed = false;
            rooms[room].users = rooms[room].users.map(u => {
                return {...u, voted: false, vote: ''}
            });
            writeRooms(rooms);
            io.to(room).emit('result-reset', rooms[room]);
        })
    });
}