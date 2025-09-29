import { Agent } from '@xmtp/agent-sdk';
import { getTestUrl } from '@xmtp/agent-sdk/debug';

// Создаем агента с настройками окружения
const agent = await Agent.createFromEnv({
  env: 'dev', // используем dev окружение для Sepolia Testnet
});

// Обрабатываем текстовые сообщения
agent.on('text', async (ctx) => {
  const message = ctx.message.content.toLowerCase().trim();
  
  // Простая логика ответа
  if (message.includes('привет') || message.includes('hello')) {
    await ctx.sendText('👋 Привет! Я простой XMTP агент. Напиши мне что-нибудь!');
  } else if (message.includes('как дела') || message.includes('how are you')) {
    await ctx.sendText('Отлично работаю! Спасибо, что спросил 😊');
  } else if (message.includes('помощь') || message.includes('help')) {
    await ctx.sendText('Я могу отвечать на твои сообщения. Просто напиши мне что-нибудь!');
  } else {
    await ctx.sendText(`Ты написал: "${ctx.message.content}"\n\nЯ получил твое сообщение! 👍`);
  }
});

// Логируем запуск агента
agent.on('start', () => {
  console.log('🚀 XMTP Agent запущен!');
  console.log(`📬 Адрес агента: ${agent.address}`);
  console.log(`🔗 Тестовая ссылка: ${getTestUrl(agent.client)}`);
  console.log('⏳ Ожидаю сообщений...');
});

// Обработка ошибок
agent.on('error', (error) => {
  console.error('❌ Ошибка агента:', error);
});

// Запускаем агента
await agent.start();
