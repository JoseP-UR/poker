class User {
    constructor(name, io, socket) {
        this.name = name;
        this.io = io;
        this.socket = socket;
        this.id = socket.id;
        this.room = '';
    }

    joinRoom(room) {
        this.room = room;
        this.socket.join(room);
        this.io.to(room).emit('user-joined', {
            name: this.name,
            id: this.id
        });
    }
}

export default User;