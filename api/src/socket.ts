import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from './utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

class SocketManager {
  private io: Server | null = null;
  private userSockets: Map<string, Set<Socket>> = new Map();
  private eventPresence: Map<string, Set<string>> = new Map(); // eventId -> Set<userId>

  init(server: any) {
    this.io = new Server(server, {
      cors: { origin: true, credentials: true },
    });

    this.io.use((socket, next) => {
      const cookieHeader = socket.handshake.headers.cookie;
      let token: string | undefined;

      if (cookieHeader) {
        // Parse the jwt cookie
        const cookies = cookieHeader.split(';').map((c) => c.trim());
        const jwtCookie = cookies.find((c) => c.startsWith('jwt='));
        if (jwtCookie) {
          token = jwtCookie.split('=')[1];
        }
      } else if (socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      }

      if (!token) {
        logger.warn('Socket connection attempt without token', { socketId: socket.id });
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        socket.data.userId = decoded.userId;
        logger.debug('Socket authenticated', { userId: decoded.userId, socketId: socket.id });
        next();
      } catch (err) {
        logger.warn('Socket authentication failed', { error: err, socketId: socket.id });
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket);
      logger.info('User connected via socket', { userId, socketId: socket.id });

      // Handle joining an event room
      socket.on('join-event', (eventId: string) => {
        socket.join(`event-${eventId}`);
        socket.data.eventId = eventId; // Store eventId for message sending
        const wasPresent = this.eventPresence.get(eventId)?.has(userId) || false;

        if (!this.eventPresence.has(eventId)) {
          this.eventPresence.set(eventId, new Set());
        }
        this.eventPresence.get(eventId)!.add(userId);

        if (!wasPresent) {
          // Send current presence list to the joining user
          const currentPresence = Array.from(this.eventPresence.get(eventId) || []);
          socket.emit('presence-update', { eventId, presentUsers: currentPresence });

          // Emit to all users in the event room except the joining user
          socket.to(`event-${eventId}`).emit('user-present', { userId, eventId });
          logger.debug('User joined event room', { userId, eventId, socketId: socket.id });
        }
      });

      // Handle leaving an event room
      socket.on('leave-event', (eventId: string) => {
        socket.leave(`event-${eventId}`);
        delete socket.data.eventId; // Clean up
        const eventUsers = this.eventPresence.get(eventId);
        if (eventUsers) {
          const wasPresent = eventUsers.has(userId);
          eventUsers.delete(userId);

          if (wasPresent && eventUsers.size === 0) {
            this.eventPresence.delete(eventId);
          } else if (wasPresent) {
            // Check if user has any other sockets in this event room
            const userSockets = this.userSockets.get(userId);
            let stillPresent = false;
            if (userSockets) {
              for (const userSocket of userSockets) {
                if (userSocket.rooms.has(`event-${eventId}`)) {
                  stillPresent = true;
                  break;
                }
              }
            }

            if (!stillPresent) {
              // Emit to all users in the event room except the leaving user
              socket.to(`event-${eventId}`).emit('user-left', { userId, eventId });
              logger.debug('User left event room', { userId, eventId, socketId: socket.id });
            }
          }
        }
      });

      // Handle sending chat messages
      socket.on('send-message', (data: { message: string }) => {
        const eventId = socket.data.eventId;
        if (!eventId) {
          logger.warn('Attempted to send message without being in an event room', {
            userId,
            socketId: socket.id,
          });
          return;
        }

        // Emit to all users in the event room
        this.emitToEvent(eventId, 'new-message', {
          userId,
          message: data.message,
          timestamp: new Date(),
        });
        logger.debug('Chat message sent', { userId, eventId, socketId: socket.id });
      });

      socket.on('disconnect', () => {
        const userId = socket.data.userId;
        const sockets = this.userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket);
          if (sockets.size === 0) {
            this.userSockets.delete(userId);

            // Handle user completely disconnecting from all event rooms
            for (const [eventId, users] of this.eventPresence.entries()) {
              if (users.has(userId)) {
                users.delete(userId);
                if (users.size === 0) {
                  this.eventPresence.delete(eventId);
                } else {
                  // Emit user-left to remaining users in the event room
                  socket.to(`event-${eventId}`).emit('user-left', { userId, eventId });
                }
              }
            }
          }
        }
        logger.info('User disconnected from socket', { userId, socketId: socket.id });
      });
    });
  }

  emitToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socket) => {
        socket.emit(event, data);
      });
      logger.debug('Emitted event to user sockets', { userId, event, socketCount: sockets.size });
    } else {
      logger.debug('No sockets found for user', { userId, event });
    }
  }

  emitToEvent(eventId: string, event: string, data: any, excludeUserId?: string) {
    const room = `event-${eventId}`;
    if (excludeUserId) {
      this.io?.to(room).except(this.getUserSocketIds(excludeUserId)).emit(event, data);
    } else {
      this.io?.to(room).emit(event, data);
    }
    logger.debug('Emitted event to event room', { eventId, event, excludeUserId });
  }

  emitToAll(event: string, data: any) {
    let totalSockets = 0;
    for (const sockets of this.userSockets.values()) {
      sockets.forEach((socket) => {
        socket.emit(event, data);
        totalSockets++;
      });
    }
    logger.debug('Emitted event to all sockets', { event, totalSockets });
  }

  private getUserSocketIds(userId: string): string[] {
    const sockets = this.userSockets.get(userId);
    return sockets ? Array.from(sockets).map((socket) => socket.id) : [];
  }

  getEventPresence(eventId: string): string[] {
    const users = this.eventPresence.get(eventId);
    return users ? Array.from(users) : [];
  }
}

const socketManager = new SocketManager();

export default socketManager;
