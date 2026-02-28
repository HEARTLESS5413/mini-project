const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
    },
});

// Track online users
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;
    console.log(`User connected: ${userId || socket.id}`);

    // User comes online
    socket.on('user:online', (uid) => {
        onlineUsers.set(uid, socket.id);
        io.emit('users:online', Array.from(onlineUsers.keys()));
        console.log(`User online: ${uid}`);
    });

    // Join a conversation room
    socket.on('conversation:join', (conversationId) => {
        socket.join(`conv:${conversationId}`);
        console.log(`Socket ${socket.id} joined conv:${conversationId}`);
    });

    // Send a message
    socket.on('message:send', (data) => {
        const { conversationId, text, senderId } = data;
        const message = {
            id: `msg-${Date.now()}`,
            conversationId,
            sender_id: senderId || userId,
            text,
            created_at: new Date().toISOString(),
        };
        // Broadcast to room
        io.to(`conv:${conversationId}`).emit('message:new', message);
        console.log(`Message in conv:${conversationId}: ${text}`);
    });

    // Typing indicator
    socket.on('typing:start', (conversationId) => {
        socket.to(`conv:${conversationId}`).emit('typing:show', {
            userId: userId || socket.id,
            conversationId,
        });
    });

    // ── Call Signaling ──

    // Initiate a call
    socket.on('call:initiate', ({ targetUserId, callType, signal }) => {
        const targetSocketId = onlineUsers.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:incoming', {
                from: userId || socket.id,
                callType,
                signal,
            });
            console.log(`Call initiated: ${userId} -> ${targetUserId} (${callType})`);
        }
    });

    // Answer a call
    socket.on('call:answer', ({ targetUserId, signal }) => {
        const targetSocketId = onlineUsers.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:answered', {
                from: userId || socket.id,
                signal,
            });
        }
    });

    // ICE candidate
    socket.on('call:ice-candidate', ({ targetUserId, candidate }) => {
        const targetSocketId = onlineUsers.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:ice-candidate', {
                from: userId || socket.id,
                candidate,
            });
        }
    });

    // End call
    socket.on('call:end', ({ targetUserId }) => {
        const targetSocketId = onlineUsers.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call:ended', {
                from: userId || socket.id,
            });
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (userId) {
            onlineUsers.delete(userId);
            io.emit('users:online', Array.from(onlineUsers.keys()));
        }
        console.log(`User disconnected: ${userId || socket.id}`);
    });
});

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║  Socket.io Server running on :${PORT}   ║
  ║  Handles: Chat, Typing, Call signals  ║
  ╚═══════════════════════════════════════╝
  `);
});
