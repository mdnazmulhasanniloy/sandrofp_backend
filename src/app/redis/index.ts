import { createClient } from 'redis';
import colors from 'colors';
import { Queue } from 'bullmq';
import config from '../config';

const redisHost = config.redis_host || 'sandrofp_redis';
const redisPort = parseInt(config.redis_port || '6379');
const redisUrl = `redis://${redisHost}:${redisPort}`;

// const redisUrl =
//   config?.redisUrl || 'redis://sandrofp_redis:6379' || 'redis://localhost:6379';

const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

const connectRedis = async () => {
  await Promise.all([pubClient.connect(), subClient.connect()]);
  console.log(colors.blue.bold('✨ Connected to Redis server'));
};

// BullMQ Queue (use proper connection object)
const messageQueue = new Queue('save_messages', {
  connection: {
    host: redisHost,
    port: redisPort,
  },
});

// const messageQueue = new Queue('save_messages', {
//   connection: pubClient,
// });

// Subscribe to new message channel
subClient.subscribe('new_message_channel', async rawMessage => {
  const message = JSON.parse(rawMessage);

  // Bonus part: Save to message queue
  await messageQueue.add('save', message);

  // Emit to receiver via socket
  const receiverSocketId = await pubClient.hGet(
    'socket_map',
    message.receiverId,
  );
  if (receiverSocketId) {
    // io.to(receiverSocketId).emit('new_message', message);
  }
});

export { pubClient, subClient, connectRedis, messageQueue };
