const getRooms = require('../utils/getRooms');
const writeRooms = require('../utils/writeRooms');
const sendRoomMessage = require('./sendRoomMessage');

module.exports = (socket, io, userMap) => {
    socket.on('disconnect', () => {
        let rooms = getRooms();
        let room = userMap[socket.id]

        console.log(`User disconnected ${socket.id} room: ${room}`);

        user = rooms[room].users.filter(u => {
            return u.id == socket.id;
        })[0];

        rooms[room].users = rooms[room].users.filter(u => {
            return u.id != socket.id;
        })

        if (user.leader && rooms[room].users.length > 0) {
            rooms[room].users[0].leader = true;
            io.to(room).emit('leader-change', rooms[room]);
            sendRoomMessage(io, room, {
                type: 'status',
                message: `User ${rooms[room].users[0].name} is the leader now`
            })
        }

        let disconnectMessage = {
            type: 'status',
            message: `${user.name} has disconnected`
        };

        rooms[room].messages.push(disconnectMessage)

        writeRooms(rooms);
        sendRoomMessage(io, room, disconnectMessage);
        io.to(room).emit('user-disconnect', rooms[room]);
        delete userMap[socket.id];
    });
}