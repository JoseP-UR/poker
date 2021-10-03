import User from '../src/user.js';
import { describe, test, expect, jest } from '@jest/globals';
import mockIo from './mocks/mockIo.js';
import EventEmitter from 'events';

describe('User', () => {
    const mockSocket = mockIo;
    mockSocket.id = '123';
    const user = new User('test', mockIo, mockSocket);
    
    test('should instantiate with a name, an ioObj and a socketObj', () => {
        expect(user.name).toBe('test');
        expect(user.io).toBe(mockIo);
        expect(user.socket).toBe(mockSocket);
        expect(user.id).toBe('123');
        expect(user.room).toBe('');
    });

    test('should be able to join a room', () => {
        jest.spyOn(user, user.joinRoom.name);
        jest.spyOn(user.socket, user.socket.join.name)
        jest.spyOn(user.io, user.io.to.name).mockReturnValue(mockSocket);
        jest.spyOn(mockSocket, mockSocket.emit.name);

        user.joinRoom('testRoom');

        expect(user.socket.join).toHaveBeenCalledWith('testRoom');
        expect(user.io.to).toHaveBeenCalledWith('testRoom');
        expect(mockSocket.emit).toHaveBeenCalledWith('user-joined', {
            name: user.name,
            id: user.id
        });
        expect(user.room).toBe('testRoom');
    });

    test.todo('should register a vote');
    test.todo('should be the leader');
    test.todo('should reveal the votes as a leader');
    test.todo('should reset the votes as a leader');
})
