export default class Room {
    constructor(name, ioObj) {
        this.name = name;
        this.users = [];
        this.messages = [];
        this.revealed = false;
        this.io = ioObj;
        this.expires = new Date(Date.now() + (24 * 60 * 60 * 1000));
    }

    addMessage(message) {
        this.messages.push(message);
        this.io.emit('user-message', message);
    }

    addUser(user) {
        this.users.push(user);
        this.io.emit('user-join', user);
    }

    removeUser(user) {
        this.users = this.users.filter(u => u.id !== user.id);
        this.io.emit('user-leave', user);
    }

    getUsers() {
        return this.users;
    }

    getUser(id) {
        return this.users.find(u => u.id === id);
    }

    getMessages() {
        return this.messages;
    }

    getVotes() {
        const result = this.users.map((user) => {
            return { user: user.name, vote: user.vote }
        });
        this.io.emit('room-votes', result);
        return result;
    }

    toggleVotes() {
        this.revealed = !this.revealed;
        this.io.emit('toggle-votes', this.revealed);
        if (this.revealed) {
            this.io.emit('room-votes', this.getVotes());
        }
    }
}