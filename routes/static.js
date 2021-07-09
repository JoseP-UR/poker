const newRoom = require('../utils/newRoom');
const getRooms = require('../utils/getRooms');
const writeRooms = require('../utils/writeRooms');
const path = require('path');

function getViewPath(filename) {
    return path.resolve(__dirname, `../views/${filename}`)
}

module.exports = app => {
    app.get('/', async (req, res) => {
        let { room, pwd } = req.query;
        let rooms = getRooms();

        room = room ? room : Math.floor(Math.random() * 999);
        pwd = pwd ? pwd : `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`

        console.log('cleaning rooms');
        let roomNames = Object.keys(rooms);
        roomNames.forEach(r => {
            let expiryTime = 1000 * 60 * process.env.ROOM_EXPIRATION_MINUTES;
            if ((rooms[r] && rooms[r].users) && rooms[r].users.length == 0 && (new Date().getTime() - rooms[r].created > expiryTime)) {
                console.log(`removing room ${r}`);
                delete rooms[r];
            }
        });
        writeRooms(rooms);

        if (!rooms[room]) {
            console.log('creating room...');
            const maxRooms = rooms.length < process.env.MAX_ROOM_COUNT

            if (!maxRooms) {
                console.log('creating room');
                rooms[room] = newRoom(pwd);
                writeRooms(rooms);
                res.redirect(`/?room=${room}&pwd=${pwd}`)
            }
        }

        res.sendFile(getViewPath('index.html'));
    });

    app.get('/poker.js', (req, res) => {
        res.sendFile(getViewPath('poker.js'));
    });

    app.get('/style.css', (req, res) => {
        res.sendFile(getViewPath('style.css'));
    });

    app.get('/socket.io.min.js', (req, res) => {
        res.sendFile(getViewPath('socket.io.min.js'));
    });
}