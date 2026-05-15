import { Server } from 'socket.io';

let io;
const userSockets = new Map();

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // When a user logs in, frontend emits this
    socket.on('register', (userId) => {
      userSockets.set(userId, socket.id);
      console.log(`[Socket] Registered User ${userId} with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      // Remove from map if disconnected
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`[Socket] Unregistered User ${userId}`);
          break;
        }
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper to get a user's socket ID
export const getUserSocketId = (userId) => {
  return userSockets.get(userId?.toString());
};
