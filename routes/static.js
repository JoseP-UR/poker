const newRoom = require('../utils/newRoom');
const getRooms = require('../utils/getRooms');
const writeRooms = require('../utils/writeRooms');
const log = require('../utils/log');
const path = require('path');

const { MAX_ROOM_COUNT, ROOM_EXPIRATION_MINUTES } = process.env

function getViewPath(filename) {
    return path.resolve(__dirname, `../views/${filename}`)
}

module.exports = app => {
    app.get('/', async (req, res) => {
        let { room, pwd } = req.query;
        let rooms = getRooms();

        room = room ? room : Math.floor(Math.random() * 999);
        pwd = pwd ? pwd : `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`

        log('cleaning rooms');
        let roomNames = Object.keys(rooms);
        roomNames.forEach(r => {
            let expiryTime = 1000 * 60 * ROOM_EXPIRATION_MINUTES;
            if (((rooms[r] && rooms[r].users) && rooms[r].users.length == 0 && (new Date().getTime() - rooms[r].created > expiryTime)) || ((rooms[r] && rooms[r].users) && rooms[r].users.length == 0 && rooms.length >= MAX_ROOM_COUNT)) {
                log(`removing room ${r}`);
                delete rooms[r];
            }
        });
        writeRooms(rooms);

        if (!rooms[room]) {
            log('creating room...');
            const maxRooms = rooms.length < MAX_ROOM_COUNT

            if (!maxRooms) {
                log('creating room');
                rooms[room] = newRoom(pwd);
                writeRooms(rooms);
                res.redirect(`/?room=${room}&pwd=${pwd}`)
                return;
            }
        }

        res.sendFile(getViewPath('index.html'));
    });

    app.get('/js/:js', (req, res) => {
        const {js} = req.params;

        res.sendFile(getViewPath(`assets/js/${js}`));
    });

    app.get('/styles/:style', (req, res) => {
        const {style} = req.params;

        res.sendFile(getViewPath(`assets/css/${style}`));
    });


    app.get('/cards/:card', (req, res)=> {
        const {card} = req.params;
        const cardArr = card.split('.');
        res.sendFile(getViewPath(`assets/img/cards/compressed/${cardArr[0]}-min.${cardArr[1]}`));
    });
}