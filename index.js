import { Client } from '@xmtp/node-sdk';
import { ethers } from 'ethers';
import { getRandomValues } from 'node:crypto';

// Создаём signer для V3 (EOA с приватным ключом)
function createSigner(privateKey, provider) {
  const wallet = new ethers.Wallet(privateKey, provider);
  return {
    type: 'EOA',
    getIdentifier: () => ({
      identifier: wallet.address,
      identifierKind: 'Ethereum', // Или используй константу, если есть в SDK
    }),
    signMessage: async (message) => {
      const signature = await wallet.signMessage(message);
      return ethers.getBytes(signature); // Возвращаем Uint8Array для V3
    },
  };
}

// Функция для создания клиента V3
async function createClient() {
  const walletKey = process.env.XMTP_WALLET_KEY;
  if (!walletKey) {
    throw new Error('XMTP_WALLET_KEY не установлен в env');
  }

  // RPC для Sepolia
  const rpcUrl = 'https://eth-sepolia.g.alchemy.com/v2/mRihUxWF22AZILcoI3b3V';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Парсим приватный ключ
  const privateKey = walletKey.startsWith('0x') ? walletKey : '0x' + walletKey;

  // Создаём signer
  const signer = createSigner(privateKey, provider);

  // Генерируем или используем dbEncryptionKey из env (для V3)
  let dbEncryptionKey;
  const envKey = process.env.XMTP_DB_ENCRYPTION_KEY;
  if (envKey) {
    // Конвертируем hex-строку из env в Uint8Array
    dbEncryptionKey = ethers.getBytes(envKey);
  } else {
    // Генерируем случайный (минимум 32 байта)
    dbEncryptionKey = getRandomValues(new Uint8Array(32));
    console.log('Сгенерирован новый dbEncryptionKey. Сохрани его в env для постоянства!');
  }

  // Env для dev (Sepolia)
  const env = process.env.XMTP_ENV || 'dev';

  // Создаём клиент V3
  const client = await Client.create(signer, { 
    dbEncryptionKey,
    env 
  });

  return client;
}

// Основная функция агента
async function startAgent() {
  try {
    const client = await createClient();
    console.log(`Агент запущен в V3! Адрес: ${client.address}`);
    console.log(`Среда: ${process.env.XMTP_ENV || 'dev'}`);
    console.log(`RPC: Alchemy Sepolia`);

    // Слушаем новые входящие разговоры и сообщения (V3 стиль)
    for await (const conversation of client.conversations.streamIncoming()) {
      console.log(`Новый разговор с: ${conversation.peerAddress}`);
      for await (const message of conversation.streamMessages()) {
        const incomingMessage = message.content.toString().toLowerCase();
        let reply;

        if (incomingMessage.includes('как дела') || incomingMessage.includes('how are you')) {
          reply = 'У меня всё отлично! А у тебя?';
        } else {
          reply = `Я услышал: ${message.content.toString()}. Расскажи больше!`;
        }

        // Отправляем ответ (V3)
        await conversation.send(reply);
        console.log(`Отправлен ответ: ${reply}`);
      }
    }

    // Держим процесс живым (для Render)
    process.on('SIGINT', () => {
      console.log('Остановка агента...');
      client.logout();
      process.exit(0);
    });

  } catch (error) {
    console.error('Ошибка запуска агента:', error.message);
    process.exit(1);
  }
}

// Запуск
startAgent();
