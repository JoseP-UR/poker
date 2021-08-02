const getRooms = require('./getRooms')
const writeRooms = require('./writeRooms')

module.exports = () => {
    let rooms = getRooms();

    const roomArr = Object.keys(rooms);

    roomArr.forEach(r => {
        rooms[r].users = [];
    });

    writeRooms(rooms);
}