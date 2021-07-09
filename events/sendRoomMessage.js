module.exports = (io, room, message) => {
    io.to(room).emit('chat-message', message);
}