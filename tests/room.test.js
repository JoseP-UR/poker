import { describe, test, expect, jest } from '@jest/globals';
import Room from "../src/room.js";
import User from "../src/user.js";
import mockIo from "./mocks/mockIo.js";


describe('Room', () => {
    const socket = mockIo;
    test('instance should have a name, messages, users and the ioObj', () => {
        const room = new Room('test', mockIo);

        expect(room.name).toBe('test');
        expect(room.messages).toEqual([]);
        expect(room.users).toEqual([]);
        expect(room.io).toEqual(mockIo);
        expect(room.revealed).toEqual(false);
    });

    test('should have a method to add a message', () => {
        const room = new Room('test', mockIo);
        const message = {
            user: new User('test', mockIo, socket),
            text: 'test'
        };

        jest.spyOn(room, room.addMessage.name);
        jest.spyOn(mockIo, mockIo.emit.name);
        room.addMessage(message);

        expect(message.user).toBeInstanceOf(User);
        expect(room.addMessage).toHaveBeenCalled();
        expect(mockIo.emit).toHaveBeenCalledWith('user-message', message);
        expect(room.messages).toEqual([message]);
    });

    test('should have a method to add a user', () => {
        const room = new Room('test', mockIo);
        const user = new User('test', mockIo, socket);

        jest.spyOn(room, room.addUser.name);
        jest.spyOn(mockIo, mockIo.emit.name);
        room.addUser(user);

        expect(room.addUser).toHaveBeenCalledWith(user);
        expect(mockIo.emit).toHaveBeenCalledWith('user-join', user);
        expect(room.users).toEqual([user]);
    });

    test('should have a method to get the users', () => {
        const room = new Room('test', mockIo);
        const user = new User('test', mockIo, socket);

        jest.spyOn(room, room.getUsers.name);
        jest.spyOn(room, room.addUser.name);
        jest.spyOn(mockIo, mockIo.emit.name);

        room.addUser(user);
        expect(room.addUser).toHaveBeenCalledWith(user);
        expect(room.users).toEqual([user]);
        
        expect(room.getUsers()).toEqual([user]);
    });

    test('should have a method to get the messages', () => {
        const room = new Room('test', mockIo);
        const message = {
            user: new User('test', mockIo, socket),
            text: 'test'
        };

        jest.spyOn(room, room.getMessages.name);
        jest.spyOn(room, room.addMessage.name);

        room.addMessage(message);
        expect(room.addMessage).toHaveBeenCalledWith(message);
        expect(room.messages).toEqual([message]);
        
        expect(room.getMessages()).toEqual([message]);
    });

    test('should have a method to get a user by id', () => {
        const room = new Room('test', mockIo);
        const user = new User('test', mockIo, socket);

        jest.spyOn(room, room.getUser.name);
        jest.spyOn(room, room.addUser.name);

        room.addUser(user);
        expect(room.addUser).toHaveBeenCalledWith(user);
        expect(room.users).toEqual([user]);
        
        expect(room.getUser(user.id)).toEqual(user);
    });

    test('should have a method to get the votes', () => {
        const room = new Room('test', mockIo);
        const user = new User('test', mockIo, socket);
        user.vote = 'test';

        jest.spyOn(room, room.getVotes.name);
        jest.spyOn(room, room.addUser.name);
        room.addUser(user);

        expect(room.users).toEqual([user]);
        expect(room.getVotes()).toEqual([{user: user.name, vote: user.vote}]);
    });

    test('should have a method to reveal and hide the votes', () => {
        const room = new Room('test', mockIo);

        jest.spyOn(room, room.toggleVotes.name);
        jest.spyOn(mockIo, mockIo.emit.name);

        expect(room.revealed).toEqual(false);
        room.toggleVotes();

        expect(room.revealed).toEqual(true);
        expect(mockIo.emit).toHaveBeenCalledWith('toggle-votes', room.revealed);
        expect(mockIo.emit).toHaveBeenCalledWith('room-votes', room.getVotes());
    });

    test('should have a method to remove a user', () => {
        const room = new Room('test', mockIo);
        const user = new User('test', mockIo, socket);

        jest.spyOn(room, room.removeUser.name);
        jest.spyOn(room, room.addUser.name);
        jest.spyOn(mockIo, mockIo.emit.name);

        room.addUser(user);
        expect(room.addUser).toHaveBeenCalledWith(user);
        expect(room.users).toEqual([user]);
        
        room.removeUser(user);
        expect(mockIo.emit).toHaveBeenCalledWith('user-leave', user);
        expect(room.users).toEqual([]);
    });
});