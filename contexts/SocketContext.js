'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (!user) return;

        const s = connectSocket(user.id);

        s.on('connect', () => {
            setConnected(true);
            setSocket(s);
            s.emit('user:online', user.id);
        });

        s.on('disconnect', () => {
            setConnected(false);
        });

        s.on('users:online', (users) => {
            setOnlineUsers(users);
        });

        return () => {
            disconnectSocket();
            setSocket(null);
            setConnected(false);
        };
    }, [user]);

    const sendMessage = useCallback((conversationId, message) => {
        if (socket && connected) {
            socket.emit('message:send', { conversationId, ...message });
        }
    }, [socket, connected]);

    const joinConversation = useCallback((conversationId) => {
        if (socket && connected) {
            socket.emit('conversation:join', conversationId);
        }
    }, [socket, connected]);

    const sendTyping = useCallback((conversationId) => {
        if (socket && connected) {
            socket.emit('typing:start', conversationId);
        }
    }, [socket, connected]);

    // Call signaling
    const initiateCall = useCallback((targetUserId, callType, signal) => {
        if (socket && connected) {
            socket.emit('call:initiate', { targetUserId, callType, signal });
        }
    }, [socket, connected]);

    const answerCall = useCallback((targetUserId, signal) => {
        if (socket && connected) {
            socket.emit('call:answer', { targetUserId, signal });
        }
    }, [socket, connected]);

    const sendIceCandidate = useCallback((targetUserId, candidate) => {
        if (socket && connected) {
            socket.emit('call:ice-candidate', { targetUserId, candidate });
        }
    }, [socket, connected]);

    const endCall = useCallback((targetUserId) => {
        if (socket && connected) {
            socket.emit('call:end', { targetUserId });
        }
    }, [socket, connected]);

    return (
        <SocketContext.Provider
            value={{
                socket,
                connected,
                onlineUsers,
                sendMessage,
                joinConversation,
                sendTyping,
                initiateCall,
                answerCall,
                sendIceCandidate,
                endCall,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

export default SocketContext;
