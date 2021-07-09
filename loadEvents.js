const authEvent = require('./events/auth');

module.exports = (socket, io, userMap, ...params) => {
    authEvent(socket, io, userMap);
}