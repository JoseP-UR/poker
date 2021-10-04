class User {
    constructor(name, io, socket) {
        this.name = name;
        this.io = io;
        this.socket = socket;
        this.id = socket.id;
        this.room = null;
        this.leader = false;
        this.vote = null;
    }

    joinRoom(room) {
        this.room = room;
        this.socket.join(room.name);
        this.io.to(room.name).emit('user-joined', {
            name: this.name,
            id: this.id
        });
    }

    registerVote(vote) {
        this.vote = vote;
        this.io.to(this.room).emit('user-vote', {
            name: this.name,
            id: this.id
        });
    }

    isLeader(trueOrFalse) {
        this.leader = trueOrFalse;
        this.io.to(this.room).emit('leader-change', {
            name: this.name,
            id: this.id,
        });
    }
}

export default User;