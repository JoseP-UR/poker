const getRooms = require('../utils/getRooms');
const writeRooms = require('../utils/writeRooms');
const sendRoomMessage = require('./sendRoomMessage');
const sanitizeHtml = require('../utils/sanitizeHtml');

module.exports = (socket, io) => {
    socket.on('chat-message', data => {
        const { room, pwd, user, message } = data;
        let rooms = getRooms();

        const chatMessage = {
            type: 'user',
            user,
            message: sanitizeHtml(message)
        }

        rooms[room].messages.push(chatMessage)

        writeRooms(rooms);
        sendRoomMessage(io, room, chatMessage);
    })
}