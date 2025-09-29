import { Agent } from '@xmtp/agent-sdk';

// Создаём агента из переменных окружения
const agent = await Agent.createFromEnv({
  env: process.env.XMTP_ENV || 'dev',
});

// Обработчик текстовых сообщений
agent.on('text', async (ctx) => {
  const message = ctx.message.text.toLowerCase();
  let reply;

  if (message.includes('как дела') || message.includes('how are you')) {
    reply = 'У меня всё отлично! А у тебя?';
  } else {
    reply = `Я услышал: ${ctx.message.text}. Расскажи больше!`;
  }

  await ctx.sendText(reply);
});

// Логируем запуск
agent.on('start', () => {
  console.log('Агент запущен и ждёт сообщений...');
  console.log(`Адрес агента: ${agent.address}`);
  console.log(`Среда: ${process.env.XMTP_ENV || 'dev'}`);
});

// Запуск агента
await agent.start();
console.log('Агент остановлен только при выключении сервера.');
