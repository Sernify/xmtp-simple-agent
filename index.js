import { Agent } from '@xmtp/agent-sdk';
import { getTestUrl } from '@xmtp/agent-sdk/debug';
import { ethers } from 'ethers';

// API ключи
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || 'mRihUxWF22AZILcoI3b3V';

// Конфигурация поддерживаемых сетей
const NETWORKS = {
  sepolia: {
    name: 'Sepolia Testnet',
    rpc: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorer: 'https://sepolia.etherscan.io',
    chainId: 11155111,
    nativeCurrency: 'ETH'
  },
  ethereum: {
    name: 'Ethereum',
    rpc: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorer: 'https://etherscan.io',
    chainId: 1,
    nativeCurrency: 'ETH'
  },
  polygon: {
    name: 'Polygon',
    rpc: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorer: 'https://polygonscan.com',
    chainId: 137,
    nativeCurrency: 'MATIC'
  },
  arbitrum: {
    name: 'Arbitrum',
    rpc: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorer: 'https://arbiscan.io',
    chainId: 42161,
    nativeCurrency: 'ETH'
  },
  optimism: {
    name: 'Optimism',
    rpc: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorer: 'https://optimistic.etherscan.io',
    chainId: 10,
    nativeCurrency: 'ETH'
  },
  base: {
    name: 'Base',
    rpc: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorer: 'https://basescan.org',
    chainId: 8453,
    nativeCurrency: 'ETH'
  }
};

// Хранилище данных
const userData = new Map();
const monitoringIntervals = new Map();
let agentInstance = null;

// Инициализация провайдеров
const providers = {};
for (const [key, config] of Object.entries(NETWORKS)) {
  providers[key] = new ethers.JsonRpcProvider(config.rpc);
}

function getUserData(address) {
  if (!userData.has(address)) {
    userData.set(address, {
      wallets: [],
      transactions: [],
      monitoring: false,
      lastCheckedBlock: {},
      conversationAddress: address
    });
  }
  return userData.get(address);
}

function isValidAddress(address) {
  return ethers.isAddress(address);
}

// Получение истории транзакций через Alchemy API
async function fetchTransactionHistory(walletAddress, network) {
  try {
    const provider = providers[network];
    const config = NETWORKS[network];
    
    console.log(`📡 Получаю историю транзакций для ${walletAddress} в ${network}...`);
    
    // Используем Alchemy API для получения истории
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000); // Последние 10000 блоков
    
    const transactions = [];
    
    // Получаем транзакции отправленные С этого адреса
    const sentTxs = await provider.send('alchemy_getAssetTransfers', [{
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: 'latest',
      fromAddress: walletAddress,
      category: ['external', 'internal'],
      withMetadata: true,
      excludeZeroValue: false
    }]);
    
    // Получаем транзакции полученные НА этот адрес
    const receivedTxs = await provider.send('alchemy_getAssetTransfers', [{
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: 'latest',
      toAddress: walletAddress,
      category: ['external', 'internal'],
      withMetadata: true,
      excludeZeroValue: false
    }]);
    
    // Обрабатываем отправленные транзакции
    for (const tx of sentTxs.transfers || []) {
      const receipt = await provider.getTransactionReceipt(tx.hash);
      const transaction = await provider.getTransaction(tx.hash);
      
      if (receipt && transaction) {
        const gasUsed = receipt.gasUsed;
        const gasPrice = transaction.gasPrice || 0n;
        const fee = ethers.formatEther(gasUsed * gasPrice);
        const block = await provider.getBlock(receipt.blockNumber);
        
        transactions.push({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value || '0',
          fee: fee,
          network: network,
          networkName: config.name,
          timestamp: block ? block.timestamp * 1000 : Date.now(),
          blockNumber: receipt.blockNumber,
          type: 'sent',
          currency: config.nativeCurrency
        });
      }
    }
    
    // Обрабатываем полученные транзакции
    for (const tx of receivedTxs.transfers || []) {
      const receipt = await provider.getTransactionReceipt(tx.hash);
      const transaction = await provider.getTransaction(tx.hash);
      
      if (receipt && transaction) {
        const gasUsed = receipt.gasUsed;
        const gasPrice = transaction.gasPrice || 0n;
        const fee = ethers.formatEther(gasUsed * gasPrice);
        const block = await provider.getBlock(receipt.blockNumber);
        
        transactions.push({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value || '0',
          fee: fee,
          network: network,
          networkName: config.name,
          timestamp: block ? block.timestamp * 1000 : Date.now(),
          blockNumber: receipt.blockNumber,
          type: 'received',
          currency: config.nativeCurrency
        });
      }
    }
    
    console.log(`✅ Найдено ${transactions.length} транзакций в ${network}`);
    return transactions;
    
  } catch (error) {
    console.error(`❌ Ошибка получения истории для ${network}:`, error.message);
    return [];
  }
}

// Мониторинг новых транзакций в реальном времени
async function monitorWalletRealtime(walletAddress, network, userAddress) {
  const user = getUserData(userAddress);
  const provider = providers[network];
  const config = NETWORKS[network];
  
  try {
    // Инициализируем последний проверенный блок
    if (!user.lastCheckedBlock[network]) {
      user.lastCheckedBlock[network] = await provider.getBlockNumber();
    }
    
    console.log(`🔍 Запущен мониторинг ${walletAddress} в ${network}`);
    
    // Проверяем новые блоки каждые 12 секунд
    const intervalId = setInterval(async () => {
      try {
        const currentBlock = await provider.getBlockNumber();
        const lastChecked = user.lastCheckedBlock[network];
        
        if (currentBlock > lastChecked) {
          console.log(`🔎 Проверяю блоки ${lastChecked + 1} - ${currentBlock} в ${network}`);
          
          // Проверяем каждый новый блок
          for (let blockNum = lastChecked + 1; blockNum <= currentBlock; blockNum++) {
            const block = await provider.getBlock(blockNum, true);
            
            if (!block || !block.transactions) continue;
            
            // Проверяем каждую транзакцию в блоке
            for (const txHash of block.transactions) {
              const tx = await provider.getTransaction(txHash);
              if (!tx) continue;
              
              const fromMatch = tx.from?.toLowerCase() === walletAddress.toLowerCase();
              const toMatch = tx.to?.toLowerCase() === walletAddress.toLowerCase();
              
              if (fromMatch || toMatch) {
                console.log(`🎯 Найдена новая транзакция: ${txHash}`);
                
                // Получаем детали транзакции
                const receipt = await provider.getTransactionReceipt(txHash);
                if (!receipt) continue;
                
                const gasUsed = receipt.gasUsed;
                const gasPrice = tx.gasPrice || 0n;
                const fee = ethers.formatEther(gasUsed * gasPrice);
                const value = ethers.formatEther(tx.value || 0n);
                
                const txData = {
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: value,
                  fee: fee,
                  network: network,
                  networkName: config.name,
                  timestamp: Date.now(),
                  blockNumber: receipt.blockNumber,
                  type: fromMatch ? 'sent' : 'received',
                  currency: config.nativeCurrency,
                  gasUsed: gasUsed.toString(),
                  gasPrice: ethers.formatUnits(gasPrice, 'gwei')
                };
                
                // Добавляем в историю
                user.transactions.push(txData);
                
                // Отправляем уведомление пользователю
                await sendTransactionNotification(userAddress, txData);
              }
            }
          }
          
          user.lastCheckedBlock[network] = currentBlock;
        }
        
      } catch (error) {
        console.error(`❌ Ошибка мониторинга блока в ${network}:`, error.message);
      }
    }, 12000); // Каждые 12 секунд
    
    // Сохраняем ID интервала
    const key = `${userAddress}-${walletAddress}-${network}`;
    if (!monitoringIntervals.has(key)) {
      monitoringIntervals.set(key, []);
    }
    monitoringIntervals.get(key).push(intervalId);
    
  } catch (error) {
    console.error(`❌ Ошибка запуска мониторинга ${network}:`, error.message);
  }
}

// Отправка уведомления о транзакции
async function sendTransactionNotification(userAddress, tx) {
  if (!agentInstance) return;
  
  try {
    const emoji = tx.type === 'sent' ? '📤' : '📥';
    const typeText = tx.type === 'sent' ? 'Отправлено' : 'Получено';
    
    const message = 
      `🔔 НОВАЯ ТРАНЗАКЦИЯ ОБНАРУЖЕНА!\n\n` +
      `${emoji} Тип: ${typeText}\n` +
      `🌐 Сеть: ${tx.networkName}\n` +
      `💰 Сумма: ${tx.value} ${tx.currency}\n` +
      `⛽ Комиссия: ${tx.fee} ${tx.currency}\n` +
      `⚡ Gas Used: ${tx.gasUsed}\n` +
      `💵 Gas Price: ${tx.gasPrice} Gwei\n\n` +
      `📍 От: ${tx.from}\n` +
      `📍 Кому: ${tx.to}\n\n` +
      `🔗 Просмотреть:\n${NETWORKS[tx.network].explorer}/tx/${tx.hash}`;
    
    // Отправляем сообщение через агента
    const conversations = await agentInstance.client.conversations.list();
    const conversation = conversations.find(c => 
      c.peerAddress.toLowerCase() === userAddress.toLowerCase()
    );
    
    if (conversation) {
      await conversation.send(message);
      console.log(`✅ Уведомление отправлено пользователю ${userAddress}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления:', error.message);
  }
}

// Получение баланса
async function getBalance(address, network) {
  try {
    const provider = providers[network];
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error(`Ошибка получения баланса для ${network}:`, error.message);
    return '0';
  }
}

// Расчет статистики
function calculateStats(transactions, period) {
  const now = Date.now();
  let startTime;
  
  const monthNames = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3,
    'may': 4, 'june': 5, 'july': 6, 'august': 7,
    'september': 8, 'october': 9, 'november': 10, 'december': 11
  };
  
  if (monthNames[period.toLowerCase()] !== undefined) {
    const currentDate = new Date();
    const targetMonth = monthNames[period.toLowerCase()];
    const targetYear = targetMonth > currentDate.getMonth() ? 
      currentDate.getFullYear() - 1 : currentDate.getFullYear();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    startTime = startDate.getTime();
    
    const filtered = transactions.filter(tx => 
      tx.timestamp >= startTime && tx.timestamp <= endDate.getTime()
    );
    
    return computeStats(filtered, period);
  }
  
  switch (period.toLowerCase()) {
    case 'today':
      startTime = new Date().setHours(0, 0, 0, 0);
      break;
    case 'week':
      startTime = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case 'month':
      startTime = now - 30 * 24 * 60 * 60 * 1000;
      break;
    case 'year':
      startTime = now - 365 * 24 * 60 * 60 * 1000;
      break;
    default:
      startTime = 0;
  }
  
  const filtered = transactions.filter(tx => tx.timestamp >= startTime);
  return computeStats(filtered, period);
}

function computeStats(transactions, period) {
  let totalReceived = 0;
  let totalSent = 0;
  let totalFees = 0;
  
  transactions.forEach(tx => {
    const value = parseFloat(tx.value);
    const fee = parseFloat(tx.fee);
    
    if (tx.type === 'received') {
      totalReceived += value;
    } else {
      totalSent += value;
      totalFees += fee;
    }
  });
  
  return {
    period,
    transactions: transactions.length,
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

agentInstance = agent;

// Обработка сообщений
agent.on('text', async (ctx) => {
  const message = ctx.message.content.trim();
  const userAddr = ctx.message.senderAddress;
  const user = getUserData(userAddr);
  
  // /start
  if (message.toLowerCase().startsWith('/start') || message.toLowerCase().includes('привет')) {
    await ctx.sendText(
      '👋 Привет! Я Transaction Tracker Agent!\n\n' +
      '🎯 Я отслеживаю ваши транзакции в реальном времени и веду учет комиссий.\n\n' +
      '📝 Команды:\n' +
      '/add <адрес> - Добавить кошелек\n' +
      '/wallets - Мои кошельки\n' +
      '/balance - Проверить балансы\n' +
      '/stats <период> - Статистика\n' +
      '/history - История транзакций\n' +
      '/help - Подробная помощь\n\n' +
      '🌐 Поддерживаю: Ethereum, Sepolia, Polygon, Arbitrum, Optimism, Base\n\n' +
      '💡 Начните с: /add 0xВашАдрес'
    );
    return;
  }
  
  // /help
  if (message.toLowerCase().startsWith('/help')) {
    await ctx.sendText(
      '📚 ПОДРОБНАЯ ПОМОЩЬ\n\n' +
      '1️⃣ /add <адрес>\n' +
      'Добавляет кошелек и загружает историю транзакций\n' +
      'Пример: /add 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\n\n' +
      '2️⃣ /wallets\n' +
      'Показывает все отслеживаемые кошельки\n\n' +
      '3️⃣ /balance\n' +
      'Проверяет балансы во всех сетях\n\n' +
      '4️⃣ /stats <период>\n' +
      'Показывает статистику за период\n' +
      'Периоды: today, week, month, year\n' +
      'Или: september, october, november и т.д.\n' +
      'Пример: /stats september\n\n' +
      '5️⃣ /history\n' +
      'Последние 10 транзакций\n\n' +
      '🔔 Уведомления:\n' +
      'Я автоматически уведомлю вас о КАЖДОЙ новой транзакции с деталями!'
    );
    return;
  }
  
  // /add
  if (message.toLowerCase().startsWith('/add')) {
    const parts = message.split(' ');
    if (parts.length < 2) {
      await ctx.sendText('❌ Укажите адрес:\n/add 0xYourAddress');
      return;
    }
    
    const address = parts[1].trim();
    if (!isValidAddress(address)) {
      await ctx.sendText('❌ Некорректный адрес кошелька!');
      return;
    }
    
    if (user.wallets.includes(address.toLowerCase())) {
      await ctx.sendText('ℹ️ Этот кошелек уже отслеживается!');
      return;
    }
    
    await ctx.sendText('⏳ Добавляю кошелек и загружаю историю транзакций...\nЭто может занять минуту.');
    
    user.wallets.push(address.toLowerCase());
    
    // Загружаем историю транзакций из всех сетей
    let totalTxCount = 0;
    for (const network of Object.keys(NETWORKS)) {
      const txHistory = await fetchTransactionHistory(address, network);
      user.transactions.push(...txHistory);
      totalTxCount += txHistory.length;
      
      // Запускаем мониторинг в реальном времени
      monitorWalletRealtime(address.toLowerCase(), network, userAddr);
    }
    
    user.monitoring = true;
    
    await ctx.sendText(
      `✅ Кошелек добавлен!\n\n` +
      `📍 Адрес: ${address}\n` +
      `📊 Загружено транзакций: ${totalTxCount}\n` +
      `🔍 Мониторинг запущен во всех сетях\n\n` +
      `🔔 Теперь вы будете получать уведомления о КАЖДОЙ новой транзакции!\n\n` +
      `Используйте:\n` +
      `/history - посмотреть историю\n` +
      `/stats month - статистику`
    );
    return;
  }
  
  // /wallets
  if (message.toLowerCase().startsWith('/wallets')) {
    if (user.wallets.length === 0) {
      await ctx.sendText('📭 Нет отслеживаемых кошельков.\n\n/add 0xYourAddress');
      return;
    }
    
    let response = '💼 Отслеживаемые кошельки:\n\n';
    user.wallets.forEach((wallet, i) => {
      response += `${i + 1}. ${wallet}\n`;
    });
    response += `\n🔍 Мониторинг: ${user.monitoring ? '✅ Активен' : '❌ Неактивен'}`;
    response += `\n📊 Транзакций в базе: ${user.transactions.length}`;
    
    await ctx.sendText(response);
    return;
  }
  
  // /balance
  if (message.toLowerCase().startsWith('/balance')) {
    if (user.wallets.length === 0) {
      await ctx.sendText('📭 Добавьте кошелек: /add 0xYourAddress');
      return;
    }
    
    await ctx.sendText('⏳ Получаю балансы...');
    
    let response = '💰 БАЛАНСЫ:\n\n';
    
    for (const wallet of user.wallets) {
      response += `📍 ${wallet.slice(0, 6)}...${wallet.slice(-4)}\n`;
      
      for (const [key, config] of Object.entries(NETWORKS)) {
        const balance = await getBalance(wallet, key);
        const bal = parseFloat(balance);
        if (bal > 0) {
          response += `  ${config.name}: ${bal.toFixed(6)} ${config.nativeCurrency}\n`;
        }
      }
      response += '\n';
    }
    
    await ctx.sendText(response);
    return;
  }
  
  // /stats
  if (message.toLowerCase().startsWith('/stats')) {
    if (user.transactions.length === 0) {
      await ctx.sendText('📊 Нет данных.\n\nДобавьте кошелек: /add 0xYourAddress');
      return;
    }
    
    const parts = message.split(' ');
    const period = parts.length > 1 ? parts[1].toLowerCase() : 'month';
    
    const stats = calculateStats(user.transactions, period);
    
    const response = 
      `📊 СТАТИСТИКА ЗА ${period.toUpperCase()}\n\n` +
      `📈 Транзакций: ${stats.transactions}\n` +
      `📥 Получено: ${stats.received} ETH\n` +
      `📤 Отправлено: ${stats.sent} ETH\n` +
      `⛽ Комиссии: ${stats.fees} ETH\n` +
      `💵 Чистое: ${stats.netChange} ETH\n\n` +
      `${parseFloat(stats.netChange) >= 0 ? '✅ Прибыль' : '⚠️ Убыток'}`;
    
    await ctx.sendText(response);
    return;
  }
  
  // /history
  if (message.toLowerCase().startsWith('/history')) {
    if (user.transactions.length === 0) {
      await ctx.sendText('📜 История пуста.\n\nДобавьте кошелек: /add 0xYourAddress');
      return;
    }
    
    const recent = user.transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
    
    let response = `📜 ПОСЛЕДНИЕ ${recent.length} ТРАНЗАКЦИЙ:\n\n`;
    
    recent.forEach((tx, i) => {
      const emoji = tx.type === 'sent' ? '📤' : '📥';
      const date = new Date(tx.timestamp).toLocaleString('ru-RU');
      
      response += 
        `${i + 1}. ${emoji} ${tx.networkName}\n` +
        `   ${tx.value} ${tx.currency}\n` +
        `   Комиссия: ${tx.fee} ${tx.currency}\n` +
        `   ${date}\n` +
        `   ${NETWORKS[tx.network].explorer}/tx/${tx.hash}\n\n`;
    });
    
    await ctx.sendText(response);
    return;
  }
  
  await ctx.sendText('❓ Неизвестная команда. Используйте /help');
});

agent.on('start', () => {
  console.log('🚀 Transaction Tracker Agent ЗАПУЩЕН!');
  console.log(`📬 Адрес: ${agent.address}`);
  console.log(`🔗 Тест: ${getTestUrl(agent.client)}`);
  console.log(`🌐 Сети: ${Object.keys(NETWORKS).join(', ')}`);
  console.log('⏳ Жду сообщений...');
});

agent.on('error', (error) => {
  console.error('❌ Ошибка:', error);
});

await agent.start();
