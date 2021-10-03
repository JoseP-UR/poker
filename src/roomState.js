class RoomState {
    constructor() {
        this.rooms = [];
    }

    addRoom(room) {
        this.rooms.push(room);
    }

    removeRoom(name) {
        this.rooms = this.rooms.filter(room => room.name !== name);
    }

    getRooms() {
        return this.rooms;
    }

    getRoom(name) {
        return this.rooms.find(room => room.name === name);
    }

    removeExpiredRooms() {
        this.rooms = this.rooms.filter(room => {
            return room.users.length > 0 && room.expires <= Date.now();
        });
    }
}

export default RoomState;