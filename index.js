import { Agent } from '@xmtp/agent-sdk';
import { getTestUrl } from '@xmtp/agent-sdk/debug';
import { ethers } from 'ethers';

// Конфигурация поддерживаемых сетей
const NETWORKS = {
  ethereum: {
    name: 'Ethereum',
    rpc: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io'
  },
  sepolia: {
    name: 'Sepolia',
    rpc: process.env.ALCHEMY_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo',
    explorer: 'https://sepolia.etherscan.io'
  },
  polygon: {
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com'
  },
  arbitrum: {
    name: 'Arbitrum',
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io'
  },
  optimism: {
    name: 'Optimism',
    rpc: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io'
  },
  base: {
    name: 'Base',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org'
  }
};

// Хранилище данных пользователей
const userData = new Map();

// Инициализация провайдеров
const providers = {};
for (const [key, config] of Object.entries(NETWORKS)) {
  providers[key] = new ethers.JsonRpcProvider(config.rpc);
}

// Функция для получения данных пользователя
function getUserData(address) {
  if (!userData.has(address)) {
    userData.set(address, {
      wallets: [],
      transactions: [],
      monitoring: false
    });
  }
  return userData.get(address);
}

// Функция проверки валидности адреса
function isValidAddress(address) {
  return ethers.isAddress(address);
}

// Функция получения баланса
async function getBalance(address, network) {
  try {
    const provider = providers[network];
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error(`Ошибка получения баланса для ${network}:`, error);
    return '0';
  }
}

// Функция получения последних транзакций (упрощенная версия)
async function getRecentTransactions(address, network) {
  try {
    const provider = providers[network];
    const currentBlock = await provider.getBlockNumber();
    const transactions = [];
    
    // Проверяем последние 10 блоков
    for (let i = 0; i < 10; i++) {
      const block = await provider.getBlock(currentBlock - i, true);
      if (!block || !block.transactions) continue;
      
      for (const tx of block.transactions) {
        if (tx.from?.toLowerCase() === address.toLowerCase() ||
            tx.to?.toLowerCase() === address.toLowerCase()) {
          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: ethers.formatEther(tx.value || 0),
            gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : '0',
            network: network,
            timestamp: block.timestamp,
            type: tx.from?.toLowerCase() === address.toLowerCase() ? 'sent' : 'received'
          });
        }
      }
    }
    
    return transactions;
  } catch (error) {
    console.error(`Ошибка получения транзакций для ${network}:`, error);
    return [];
  }
}

// Функция расчета комиссии транзакции
async function getTransactionFee(txHash, network) {
  try {
    const provider = providers[network];
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) return '0';
    
    const gasUsed = receipt.gasUsed;
    const tx = await provider.getTransaction(txHash);
    const gasPrice = tx.gasPrice || 0n;
    
    const fee = gasUsed * gasPrice;
    return ethers.formatEther(fee);
  } catch (error) {
    console.error(`Ошибка расчета комиссии:`, error);
    return '0';
  }
}

// Функция мониторинга кошельков
async function monitorWallet(address, network, agent, userAddress) {
  const user = getUserData(userAddress);
  
  try {
    const provider = providers[network];
    let lastBlock = await provider.getBlockNumber();
    
    const checkInterval = setInterval(async () => {
      try {
        const currentBlock = await provider.getBlockNumber();
        
        if (currentBlock > lastBlock) {
          for (let i = lastBlock + 1; i <= currentBlock; i++) {
            const block = await provider.getBlock(i, true);
            if (!block || !block.transactions) continue;
            
            for (const tx of block.transactions) {
              if (tx.from?.toLowerCase() === address.toLowerCase() ||
                  tx.to?.toLowerCase() === address.toLowerCase()) {
                
                const fee = await getTransactionFee(tx.hash, network);
                const value = ethers.formatEther(tx.value || 0);
                const type = tx.from?.toLowerCase() === address.toLowerCase() ? 'sent' : 'received';
                
                const txData = {
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: value,
                  fee: fee,
                  network: network,
                  timestamp: Date.now(),
                  type: type
                };
                
                user.transactions.push(txData);
                
                // Отправляем уведомление
                const message = `🔔 Новая транзакция обнаружена!\n\n` +
                  `Сеть: ${NETWORKS[network].name}\n` +
                  `Тип: ${type === 'sent' ? '📤 Отправлено' : '📥 Получено'}\n` +
                  `Сумма: ${value} ETH\n` +
                  `Комиссия: ${fee} ETH\n` +
                  `От: ${tx.from?.slice(0, 10)}...\n` +
                  `Кому: ${tx.to?.slice(0, 10)}...\n` +
                  `Hash: ${tx.hash}\n` +
                  `Explorer: ${NETWORKS[network].explorer}/tx/${tx.hash}`;
                
                // Здесь нужно отправить сообщение пользователю
                console.log(`Уведомление для ${userAddress}: ${message}`);
              }
            }
          }
          lastBlock = currentBlock;
        }
      } catch (error) {
        console.error(`Ошибка мониторинга ${network}:`, error);
      }
    }, 15000); // Проверка каждые 15 секунд
    
  } catch (error) {
    console.error(`Ошибка запуска мониторинга для ${network}:`, error);
  }
}

// Функция расчета статистики
function calculateStats(transactions, period) {
  const now = Date.now();
  let startTime;
  
  switch (period) {
    case 'today':
      startTime = now - 24 * 60 * 60 * 1000;
      break;
    case 'week':
      startTime = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case 'month':
    case 'september':
    case 'october':
    case 'november':
    case 'december':
    case 'january':
    case 'february':
    case 'march':
    case 'april':
    case 'may':
    case 'june':
    case 'july':
    case 'august':
      // Упрощенный расчет для месяца
      startTime = now - 30 * 24 * 60 * 60 * 1000;
      break;
    case 'year':
      startTime = now - 365 * 24 * 60 * 60 * 1000;
      break;
    default:
      startTime = 0;
  }
  
  const filtered = transactions.filter(tx => tx.timestamp >= startTime);
  
  let totalReceived = 0;
  let totalSent = 0;
  let totalFees = 0;
  
  filtered.forEach(tx => {
    const value = parseFloat(tx.value);
    const fee = parseFloat(tx.fee);
    
    if (tx.type === 'received') {
      totalReceived += value;
    } else {
      totalSent += value;
    }
    totalFees += fee;
  });
  
  return {
    period,
    transactions: filtered.length,
    received: totalReceived.toFixed(6),
    sent: totalSent.toFixed(6),
    fees: totalFees.toFixed(6),
    netChange: (totalReceived - totalSent - totalFees).toFixed(6)
  };
}

// Создаем агента
const agent = await Agent.createFromEnv({
  env: 'dev',
});

// Обработка текстовых сообщений
agent.on('text', async (ctx) => {
  const message = ctx.message.content.trim();
  const userAddr = ctx.message.senderAddress;
  const user = getUserData(userAddr);
  
  // Команда /start
  if (message.toLowerCase().startsWith('/start') || message.toLowerCase().includes('привет')) {
    await ctx.sendText(
      '👋 Привет! Я агент для отслеживания транзакций и комиссий.\n\n' +
      '📝 Доступные команды:\n' +
      '/add <адрес> - Добавить кошелек для отслеживания\n' +
      '/wallets - Показать ваши кошельки\n' +
      '/balance - Проверить балансы\n' +
      '/stats <период> - Статистика (today/week/month/year)\n' +
      '/history - История транзакций\n' +
      '/help - Помощь\n\n' +
      'Начните с добавления вашего кошелька:\n' +
      '/add 0xYourAddress'
    );
    return;
  }
  
  // Команда /help
  if (message.toLowerCase().startsWith('/help')) {
    await ctx.sendText(
      '📚 Подробная помощь:\n\n' +
      '1️⃣ /add <адрес> - Добавить EVM кошелек\n' +
      '   Пример: /add 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\n\n' +
      '2️⃣ /wallets - Список отслеживаемых кошельков\n\n' +
      '3️⃣ /balance - Балансы во всех сетях\n\n' +
      '4️⃣ /stats <период> - Статистика за период\n' +
      '   Периоды: today, week, month, september, year\n' +
      '   Пример: /stats month\n\n' +
      '5️⃣ /history - Последние транзакции\n\n' +
      'Поддерживаемые сети:\n' +
      '• Ethereum • Sepolia • Polygon\n' +
      '• Arbitrum • Optimism • Base'
    );
    return;
  }
  
  // Команда /add
  if (message.toLowerCase().startsWith('/add')) {
    const parts = message.split(' ');
    if (parts.length < 2) {
      await ctx.sendText('❌ Укажите адрес кошелька:\n/add 0xYourAddress');
      return;
    }
    
    const address = parts[1].trim();
    if (!isValidAddress(address)) {
      await ctx.sendText('❌ Некорректный адрес кошелька. Проверьте формат.');
      return;
    }
    
    if (user.wallets.includes(address.toLowerCase())) {
      await ctx.sendText('ℹ️ Этот кошелек уже отслеживается.');
      return;
    }
    
    user.wallets.push(address.toLowerCase());
    user.monitoring = true;
    
    // Запускаем мониторинг для всех сетей
    for (const network of Object.keys(NETWORKS)) {
      monitorWallet(address.toLowerCase(), network, agent, userAddr);
    }
    
    await ctx.sendText(
      `✅ Кошелек добавлен!\n\n` +
      `📍 Адрес: ${address}\n` +
      `🔍 Мониторинг запущен во всех сетях\n\n` +
      `Вы будете получать уведомления о новых транзакциях!`
    );
    return;
  }
  
  // Команда /wallets
  if (message.toLowerCase().startsWith('/wallets')) {
    if (user.wallets.length === 0) {
      await ctx.sendText('📭 У вас нет отслеживаемых кошельков.\n\nДобавьте кошелек: /add 0xYourAddress');
      return;
    }
    
    let response = '💼 Ваши кошельки:\n\n';
    user.wallets.forEach((wallet, index) => {
      response += `${index + 1}. ${wallet}\n`;
    });
    response += '\n🔍 Мониторинг: ' + (user.monitoring ? '✅ Активен' : '❌ Неактивен');
    
    await ctx.sendText(response);
    return;
  }
  
  // Команда /balance
  if (message.toLowerCase().startsWith('/balance')) {
    if (user.wallets.length === 0) {
      await ctx.sendText('📭 Добавьте кошелек для проверки баланса: /add 0xYourAddress');
      return;
    }
    
    await ctx.sendText('⏳ Получаю балансы...');
    
    let response = '💰 Балансы кошельков:\n\n';
    
    for (const wallet of user.wallets) {
      response += `📍 ${wallet.slice(0, 10)}...${wallet.slice(-8)}\n`;
      
      for (const [key, config] of Object.entries(NETWORKS)) {
        const balance = await getBalance(wallet, key);
        response += `  ${config.name}: ${parseFloat(balance).toFixed(4)} ETH\n`;
      }
      response += '\n';
    }
    
    await ctx.sendText(response);
    return;
  }
  
  // Команда /stats
  if (message.toLowerCase().startsWith('/stats')) {
    if (user.transactions.length === 0) {
      await ctx.sendText('📊 Нет данных о транзакциях.\n\nДобавьте кошелек и дождитесь транзакций: /add 0xYourAddress');
      return;
    }
    
    const parts = message.split(' ');
    const period = parts.length > 1 ? parts[1].toLowerCase() : 'month';
    
    const stats = calculateStats(user.transactions, period);
    
    const response = `📊 Статистика за ${period}:\n\n` +
      `📈 Транзакций: ${stats.transactions}\n` +
      `📥 Получено: ${stats.received} ETH\n` +
      `📤 Отправлено: ${stats.sent} ETH\n` +
      `⛽ Комиссии: ${stats.fees} ETH\n` +
      `💵 Чистое изменение: ${stats.netChange} ETH\n\n` +
      `${parseFloat(stats.netChange) >= 0 ? '✅ Прибыль' : '⚠️ Убыток'}`;
    
    await ctx.sendText(response);
    return;
  }
  
  // Команда /history
  if (message.toLowerCase().startsWith('/history')) {
    if (user.transactions.length === 0) {
      await ctx.sendText('📜 История транзакций пуста.\n\nДобавьте кошелек: /add 0xYourAddress');
      return;
    }
    
    const recent = user.transactions.slice(-5).reverse();
    let response = '📜 Последние транзакции:\n\n';
    
    recent.forEach((tx, index) => {
      response += `${index + 1}. ${tx.type === 'sent' ? '📤' : '📥'} ${NETWORKS[tx.network].name}\n` +
        `   Сумма: ${tx.value} ETH\n` +
        `   Комиссия: ${tx.fee} ETH\n` +
        `   Hash: ${tx.hash.slice(0, 10)}...\n\n`;
    });
    
    await ctx.sendText(response);
    return;
  }
  
  // Неизвестная команда
  await ctx.sendText(
    '❓ Неизвестная команда.\n\n' +
    'Используйте /help для списка команд.'
  );
});

// Логируем запуск агента
agent.on('start', () => {
  console.log('🚀 Transaction Tracker Agent запущен!');
  console.log(`📬 Адрес агента: ${agent.address}`);
  console.log(`🔗 Тестовая ссылка: ${getTestUrl(agent.client)}`);
  console.log('⏳ Ожидаю сообщений...');
  console.log(`🌐 Поддерживаемые сети: ${Object.keys(NETWORKS).join(', ')}`);
});

// Обработка ошибок
agent.on('error', (error) => {
  console.error('❌ Ошибка агента:', error);
});

// Запускаем агента
await agent.start();
