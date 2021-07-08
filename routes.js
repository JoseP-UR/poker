const fs = require('fs');
const newRoom = require('./helpers/newRoom');
module.exports = async function (app) {

    app.get('/', async (req,res) => {
        let { room, pwd } = req.query;
        let rooms = JSON.parse(fs.readFileSync('./rooms.json'));

        console.log('cleaning rooms');
        let roomNames = Object.keys(rooms);
        roomNames.forEach(r => {
            let expiryTime = 1000 * 60 * process.env.ROOM_EXPIRATION_MINUTES;
            if ((rooms[r] && rooms[r].users) && rooms[r].users.length == 0 && (new Date().getTime() - rooms[r].created > expiryTime)) {
                console.log(`removing room ${r}`);
                delete rooms[r];
            }
        });

        fs.writeFileSync('./rooms.json', JSON.stringify(rooms));
        room = room ? room : Math.floor(Math.random() * 999);
        pwd = pwd ? pwd : `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`

        if (!rooms[room]) {
            console.log('creating room...');
            const maxRooms = rooms.length < process.env.MAX_ROOM_COUNT

            await res.cookie('maxrooms', maxRooms, {
                httpOnly: false,
                maxAge: 600
            });

            if (!maxRooms) {
                console.log('creating room');
                rooms[room] = newRoom(pwd);
                fs.writeFileSync('./rooms.json', JSON.stringify(rooms));
                res.redirect(`/?room=${room}&pwd=${pwd}`)
            }
        }

        res.sendFile(`${__dirname}/views/index.html`);
    });
    
    app.get('/poker.js', (req,res) => {
        res.sendFile(`${__dirname}/views/poker.js`);
    });

    app.get('/style.css', (req,res) => {
        res.sendFile(`${__dirname}/views/style.css`);
    });

    app.get('/socket.io.min.js', (req,res) => {
        res.sendFile(`${__dirname}/views/socket.io.min.js`);
    });

    
}