import { tryCatch } from 'bullmq';
const { Server } = require('socket.io');
import { Server as HttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { socketAuthMiddleware } from './middleware/auth.socket';
import { Socket } from 'socket.io';
import { getOnlineUserIds } from './handlers/onlineUser.handlers';
import { connectRedis, pubClient, subClient } from '../redis';
import MessagePageHandlers from './handlers/massagePage.handlers';
import getChatList from './handlers/chatList.handlers';
import SeenMessageHandlers from './handlers/seenMessages.handlers';
import sendMessage from './handlers/sendMessage.handlers';
import callbackFn from '../utils/callbackFn';
import generateCryptoString from '../utils/generateCryptoString';

const initializeSocketIO = async (server: HttpServer) => {
  await connectRedis();

  const io = new Server(server, {
    adapter: createAdapter(pubClient, subClient),
    cors: {
      origin: '*',
    },
  });

  io.adapter(createAdapter(pubClient, subClient));
  io.use(socketAuthMiddleware);
  global.socketio = io;
  io.on('connection', async (socket: Socket) => {
    console.log(`New client connected: ${socket.id} :: ${socket.data?.email}`);
    const userId = socket.data?.userId as string;
    if (!userId) {
      console.warn(`Socket ${socket.id} connected without userId`);
      return;
    }
    // Redis ID -> socketID map
    await pubClient.hSet('userId_to_socketId', userId, socket.id);

    //  socketID -> userId map
    await pubClient.hSet('socketId_to_userId', socket.id, userId);

    // online users
    socket.on('getOnlineUsers', async () => getOnlineUserIds(io));

    //message page
    socket.on(
      'message_page',
      async (payload: { userId: string }, callback: any) =>
        MessagePageHandlers(io, payload?.userId, userId, callback),
    );
    //my chat list
    socket.on('my_chat_list', async ({}, callback: any) =>
      getChatList(io, socket?.data, callback),
    );

    //seen message
    socket.on('seen', async ({ chatId }: { chatId: string }, callback: any) =>
      SeenMessageHandlers(io, chatId, socket?.data, callback),
    );
    //send message
    socket.on('send_message', async (payload: any, callback: any) =>
      sendMessage(io, payload, socket?.data, callback),
    );

    /**
     * **************************************************************** calling test project ****************************************************************
     */
    // Call User
    socket.on('call-user', async (data, callBack) => {
      try {
        const { to, offer } = data;

        // Check if the receiver is valid
        if (!to?._id) {
          return callbackFn(callBack, {
            success: false,
            message: 'user ID is undefined',
          });
        }

        // Get the socket ID of the receiver
        const socketId = await pubClient.hGet('userId_to_socketId', to?._id);

        // If receiver is online, emit the incoming call event
        if (socketId) {
          io.to(socketId).emit('incoming-call', {
            from: { ...socket.data, _id: socket?.data?.userId },
            offer,
          });

          return callbackFn(callBack, {
            success: true,
            from: { ...socket.data, _id: socket?.data?.userId },
            message: 'Call sent successfully',
          });
        } else {
          return callbackFn(callBack, {
            success: false,
            message: 'receiver is not online',
          });
        }
      } catch (error) {
        console.error('Error in call-user:', error);
        return callbackFn(callBack, {
          success: false,
          message: 'Internal server error',
        });
      }
    });

    // Decline Call
    socket.on('decline-call', async (data, callback) => {
      try {
        const { to } = data;

        // Check if the receiver is valid
        if (!to?._id) {
          return callbackFn(callback, {
            success: false,
            message: 'receiver not found',
          });
        }

        // Get the socket ID of the receiver
        const socketId = await pubClient.hGet('userId_to_socketId', to._id);

        // If receiver is online, emit the call-ended event
        if (socketId) {
          io.to(socketId).emit('call-ended', { from: socket.data });
          return callbackFn(callback, {
            success: true,
            message: 'Call declined successfully',
          });
        } else {
          return callbackFn(callback, {
            success: false,
            message: 'receiver is not online',
          });
        }
      } catch (err) {
        console.error('Error in decline-call:', err);
        callbackFn(callback, {
          success: false,
          message: 'Internal server error',
        });
      }
    });

    // Accept Call
    socket.on('accept-call', async (data, callBack) => {
      try {
        const { to, answer } = data;

        // Check if the receiver is valid
        if (!to?._id) {
          return callbackFn(callBack, {
            success: false,
            message: 'receiver ID not found',
          });
        }

        // Generate a room ID
        const roomId = Math.floor(10000 + Math.random() * 90000);

        // Get the socket ID of the receiver
        const socketId = await pubClient.hGet('userId_to_socketId', to._id);

        // Emit the accepted-call event to the receiver
        if (socketId) {
          io.to(socketId).emit('accepted-call', {
            from: { ...socket.data, _id: socket?.data?.userId },
            roomId,
            answer,
          });

          return callbackFn(callBack, {
            success: true,
            data: {
              roomId,
              from: { ...socket.data, _id: socket?.data?.userId },
            },
            message: 'Call accepted successfully',
          });
        } else {
          return callbackFn(callBack, {
            success: false,
            message: 'receiver is not online',
          });
        }
      } catch (error) {
        console.error('Error in accept-call:', error);
        callbackFn(callBack, {
          success: false,
          message: 'Internal server error',
        });
      }
    });

    // Negotiate Call (for a "no-go" scenario)
    socket.on('nego-call', async (data, callBack) => {
      try {
        const { to, offer } = data;

        // Check if the receiver is valid
        if (!to) {
          return callbackFn(callBack, {
            success: false,
            message: 'receiver is undefined',
          });
        }

        // Get the socket ID of the receiver
        const socketId = await pubClient.hGet('userId_to_socketId', to);

        // If receiver is online, emit the 'nogo-incoming-call' event
        if (socketId) {
          io.to(socketId).emit('nogo-incoming-call', {
            from: { ...socket.data, _id: socket?.data?.userId },
            offer,
          });

          return callbackFn(callBack, {
            success: true,
            from: { ...socket.data, _id: socket?.data?.userId },
            message: 'Call offer sent successfully',
          });
        } else {
          return callbackFn(callBack, {
            success: false,
            message: 'receiver is not online',
          });
        }
      } catch (error) {
        console.error('Error in nego-call:', error);
        return callbackFn(callBack, {
          success: false,
          message: 'Internal server error',
        });
      }
    });

    // Accept Negotiation Call (for a "no-go" scenario)
    socket.on('nego-accept-call', async (data, callBack) => {
      try {
        const { to, answer } = data;

        // Check if the receiver is valid
        if (!to) {
          return callbackFn(callBack, {
            success: false,
            message: 'receiver is undefined',
          });
        }
        const userId = to?.userId || to?._id;
        // Get the socket ID of the receiver
        const socketId = await pubClient.hGet('userId_to_socketId', userId);

        // If receiver is online, emit the 'nego-call-accepted' event
        if (socketId) {
          io.to(socketId).emit('nego-call-accepted', {
            from: { ...socket.data, _id: socket?.data?.userId },
            answer,
          });

          return callbackFn(callBack, {
            success: true,
            from: { ...socket.data, _id: socket?.data?.userId },
            message: 'Negotiation accepted successfully',
          });
        } else {
          return callbackFn(callBack, {
            success: false,
            message: 'receiver is not online',
          });
        }
      } catch (error) {
        console.error('Error in nego-accept-call:', error);
        return callbackFn(callBack, {
          success: false,
          message: 'Internal server error',
        });
      }
    });

    //finish call
    socket.on('finish-call', async ({ to }, callBack) => {
      console.log('🚀 ~ initializeSocketIO ~ to:', to);
      try {
        console.log(to);
        if (!to) {
          return callbackFn(callBack, {
            success: false,
            message: 'receiver is undefined',
          });
        }

        const socketId = await pubClient.hGet('userId_to_socketId', to);

        io.to(socketId).emit('end-call-finished', {
          from: { ...socket.data, _id: socket.data.userId },
        });

        return callbackFn(callBack, {
          success: true,
          message: 'Call finished successfully',
        });
      } catch (error) {
        console.error('Error in finish-call:', error);
        return callbackFn(callBack, {
          success: false,
          message: 'Internal server error',
        });
      }
    });

    //mute-unmute voice
    socket.on('update-media', async ({ to, data }, callback) => {
      console.log('🚀 ~ initializeSocketIO ~ to:', to);
      try {
        if (!to)
          callbackFn(callback, {
            success: false,
            message: 'to user id is missing',
          });

        const socketId = await pubClient.hGet('userId_to_socketId', to);
        console.log('🚀 ~ initializeSocketIO ~ socketId:', socketId);
        io.to(socketId).emit('media-status', data);
        callbackFn(callback, {
          success: true,
          data: data,
          message: 'media update success',
        });
      } catch (error: any) {
        throw callbackFn(callback, {
          success: false,
          message: error?.message || 'server internal error',
        });
      }
    });

    socket.on('disconnect', async () => {
      console.log(`Client disconnected: ${socket.id}`);
      const uid = await pubClient.hGet('socketId_to_userId', socket.id);

      if (uid) {
        await pubClient.hDel('socketId_to_userId', socket.id);
        await pubClient.hDel('userId_to_socketId', uid);
        console.log(
          `Removed Redis mapping for userId ${uid} and socketId ${socket.id}`,
        );
      }
    });
  });
  return io;
};

export default initializeSocketIO;
