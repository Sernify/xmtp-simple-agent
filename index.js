import { Agent } from '@xmtp/agent-sdk';

// Создаём агента из переменных окружения
const agent = await Agent.createFromEnv({
  env: process.env.XMTP_ENV || 'dev', // dev для тестов
});

// Обработчик текстовых сообщений
agent.on('text', async (ctx) => {
  const message = ctx.message.text.toLowerCase();
  let reply;

  if (message.includes('как дела') || message.includes('how are you')) {
    reply = 'У меня всё отлично! А у...
