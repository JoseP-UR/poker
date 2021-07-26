const getRooms = require('../utils/getRooms');
const writeRooms = require('../utils/writeRooms');

module.exports = (socket, io, userMap) => {
    socket.on('user-vote', data => {
        let rooms = getRooms();

        let room = userMap[socket.id];

        if (rooms[room].revealed) {
            socket.emit('auth-fail', { message: `Votes already revealed` });
            return;
        }

        rooms[room].users = rooms[room].users.map(u => {
            if (u.id != socket.id) {
                return u
            }

            return { ...u, vote: data.vote, voted: true }
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
            socket.emit('auth-fail', { message: 'Only the leader can reveal the votes' })
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
            socket.emit('auth-fail', { message: 'Only the leader can reset the votes' })
            return;
        }

        rooms[room].revealed = false;
        rooms[room].users = rooms[room].users.map(u => {
            return { ...u, voted: false, vote: '' }
        });
        writeRooms(rooms);
        io.to(room).emit('result-reset', rooms[room]);
    })
}