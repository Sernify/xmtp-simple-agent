import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';

// Функция для создания клиента из env
async function createClient() {
  const walletKey = process.env.XMTP_WALLET_KEY;
  if (!walletKey) {
    throw new Error('XMTP_WALLET_KEY не установлен в env');
  }

  // Используем Alchemy Sepolia для dev
  const env = process.env.XMTP_ENV || 'dev';
  const rpcUrl = 'https://eth-sepolia.g.alchemy.com/v2/mRihUxWF22AZILcoI3b3V';

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Парсим приватный ключ (добавляем 0x если нужно)
  const privateKey = walletKey.startsWith('0x') ? walletKey : '0x' + walletKey;
  const wallet = new ethers.Wallet(privateKey, provider);

  // Создаём XMTP-клиента
  const xmtp = await Client.create(wallet, { env: env });

  // Устанавливаем ключи шифрования для хранилища (локальная БД для сообщений)
  const encryptionKey = process.env.XMTP_DB_ENCRYPTION_KEY;
  if (encryptionKey) {
    xmtp.setEncryptionKey(encryptionKey); // Для постоянства в Render
  }

  return xmtp;
}

// Основная функция агента
async function startAgent() {
  try {
    const xmtp = await createClient();
    console.log(`Агент запущен! Адрес: ${xmtp.address}`);
    console.log(`Среда: ${process.env.XMTP_ENV || 'dev'}`);
    console.log(`RPC: Alchemy Sepolia`);

    // Слушаем новые сообщения
    for await (const conversation of xmtp.conversations.stream()) {
      for await (const message of conversation.streamMessages()) {
        const incomingMessage = message.content.toString().toLowerCase();
        let reply;

        if (incomingMessage.includes('как дела') || incomingMessage.includes('how are you')) {
          reply = 'У меня всё отлично! А у тебя?';
        } else {
          reply = `Я услышал: ${message.content.toString()}. Расскажи больше!`;
        }

        // Отправляем ответ
        await conversation.send(reply);
        console.log(`Отправлен ответ: ${reply}`);
      }
    }

    // Держим процесс живым (для Render)
    process.on('SIGINT', () => {
      console.log('Остановка агента...');
      xmtp.logout();
      process.exit(0);
    });

  } catch (error) {
    console.error('Ошибка запуска агента:', error.message);
    process.exit(1);
  }
}

// Запуск
startAgent();
