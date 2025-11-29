import { Server, Socket } from 'socket.io';
import { pubClient } from '../../redis';
import callbackFn from '../../utils/callbackFn';
import Chat from '../../modules/chat/chat.models';
import getChatList from './chatList.handlers';

interface IPayload {
  imageUrl: string[];
  text: string;
  receiver: string;
  chat?: string;
  sender: string;
  exchanges?: string;
}
const sendMessage = async (
  io: Server,
  payload: IPayload,
  user: any,
  callback: (args: any) => void,
) => {
  console.log({
    payload,
    user,
  });
  try {
    const chat = await Chat.findOne({
      participants: { $all: [user.userId, payload.receiver] },
    });
    if (!chat) {
      const newChat = await Chat.create({
        participants: [payload?.receiver, user.userId],
        status: 'accepted',
      });
      payload.chat = newChat._id?.toString();
    } else {
      payload.chat = chat._id?.toString();
    }
    console.log({
      payload,
      user,
    });
    const message = {
      chat: payload?.chat,
      exchanges: payload?.exchanges,
      receiver: payload?.receiver,
      sender: user?.userId,
      text: payload?.text,
      imageUrl: payload.imageUrl,
      createdAt: new Date().toISOString(),
    };

    const redisKey = `chat:${payload.chat?.toString()}:messages`;
    await pubClient.rPush(redisKey, JSON.stringify(message));

    const [senderSocketId, receiverSocketId] = (await Promise.all([
      pubClient.hGet('userId_to_socketId', message.sender?.toString()),
      pubClient.hGet('userId_to_socketId', message.receiver?.toString()),
    ])) as string[];
    io.to(senderSocketId).emit('new_message', { message });
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message', { message });
    } else {
      // const reciver = await User.findById(message.receiver);
    }
    getChatList(io, { _id: payload.sender }, callback);
    getChatList(io, { _id: payload.receiver }, callback);
    callbackFn<IPayload>(callback, {
      success: true,
      message: 'message send successfully',
      data: message,
    });
  } catch (error: any) {
    console.log(error);
    callbackFn(callback, {
      success: false,
      message: error?.message,
    });
  }
};

export default sendMessage;
