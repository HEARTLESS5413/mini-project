import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
    if (socket) return socket;

    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    socket = io(url, {
        autoConnect: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
    });

    return socket;
}

export function connectSocket(userId) {
    const s = getSocket();
    if (!s.connected) {
        s.auth = { userId };
        s.connect();
    }
    return s;
}

export function disconnectSocket() {
    if (socket && socket.connected) {
        socket.disconnect();
    }
}

export default getSocket;
