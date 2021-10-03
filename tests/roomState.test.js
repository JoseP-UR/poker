import { describe, test, expect, jest } from '@jest/globals';
import RoomState from '../src/roomState.js';
import Room from '../src/room.js'
import mockIo from './mocks/mockIo.js';

describe('#RoomState', () => {
    const roomState = new RoomState();
    test('should start with empty rooms', () => {
        expect(roomState.rooms).toEqual([]);
    });

    test('should add a room', () => {
        roomState.addRoom(new Room('test', mockIo));
        expect(roomState.rooms.length).toEqual(1);
        expect(roomState.rooms[0]).toBeInstanceOf(Room);
        expect(roomState.rooms[0].name).toEqual('test');
    });

    test('should remove a room', () => {
        expect(roomState.rooms.length).toEqual(1);
        roomState.removeRoom('test');
        expect(roomState.rooms.length).toEqual(0);
    });

    test('should return the rooms', () => {
        expect(roomState.getRooms()).toEqual([]);
        roomState.addRoom(new Room('test', mockIo));
        expect(roomState.getRooms().length).toEqual(1);
    });

    test('should return a room by name', () => {
        expect(roomState.getRoom('test')).toBeInstanceOf(Room);
        expect(roomState.getRoom('test').name).toEqual('test');
    });

    test('should remove an expired room without users', () => {
        roomState.addRoom(new Room('expired', mockIo));
        expect(roomState.rooms.length).toEqual(2);
        roomState.rooms[0].users = ['test', 'foo'];
        roomState.rooms[0].expires = Date.now() - 1000;
        roomState.rooms[1].expires = Date.now() - 1000;

        roomState.removeExpiredRooms();
        expect(roomState.rooms.length).toEqual(1);
    })
});