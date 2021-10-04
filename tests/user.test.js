import User from '../src/user.js';
import Room from '../src/room.js';
import { describe, test, expect, jest } from '@jest/globals';
import mockIo from './mocks/mockIo.js';

describe('User', () => {
    const mockSocket = mockIo;
    mockSocket.id = '123';
    const user = new User('test', mockIo, mockSocket);
    
    test('should instantiate with a name, an ioObj and a socketObj', () => {
        expect(user.name).toBe('test');
        expect(user.io).toBe(mockIo);
        expect(user.socket).toBe(mockSocket);
        expect(user.id).toBe('123');
        expect(user.room).toBe(null);
        expect(user.vote).toBe(null);
        expect(user.leader).toBe(false);
    });

    test('should be able to join a room', () => {
        const room = new Room('testRoom', mockIo);
        jest.spyOn(user, user.joinRoom.name);
        jest.spyOn(user.socket, user.socket.join.name)
        jest.spyOn(user.io, user.io.to.name).mockReturnValue(mockSocket);
        jest.spyOn(mockSocket, mockSocket.emit.name);

        user.joinRoom(room);

        expect(user.socket.join).toHaveBeenCalledWith(room.name);
        expect(user.io.to).toHaveBeenCalledWith(room.name);
        expect(mockSocket.emit).toHaveBeenCalledWith('user-joined', {
            name: user.name,
            id: user.id
        });
        expect(user.room).toBe(room);
    });

    test('should register a vote', () => {
        jest.spyOn(user.socket, user.socket.emit.name);
        jest.spyOn(user, user.registerVote.name)
        jest.spyOn(user.io, user.io.to.name).mockReturnValue(mockSocket);

        user.registerVote('3');

        expect(mockSocket.emit).toHaveBeenCalledWith('user-vote', {
            name: user.name,
            id: user.id
        });

        expect(user.vote).toBe('3');
    });

    test('should be the leader', () => {
        jest.spyOn(user, user.isLeader.name)
        jest.spyOn(user.io, user.io.to.name).mockReturnValue(mockSocket);
        jest.spyOn(mockSocket, mockSocket.emit.name);

        user.isLeader(true);

        expect(mockSocket.emit).toHaveBeenCalledWith('leader-change', {
            name: user.name,
            id: user.id
        });
        expect(user.leader).toBe(true);
    });
    test('should lose leadership', () => {
        jest.spyOn(user, user.isLeader.name)
        jest.spyOn(user.io, user.io.to.name).mockReturnValue(mockSocket);
        jest.spyOn(mockSocket, mockSocket.emit.name);

        user.isLeader(false);

        expect(mockSocket.emit).toHaveBeenCalledWith('leader-change', {
            name: user.name,
            id: user.id
        });
        expect(user.leader).toBe(false);
    });

    test.todo('should handle reconnection')
    test.todo('should listen to events')
})
