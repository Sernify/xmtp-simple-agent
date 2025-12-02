# 🚀 XMTP Transaction Tracker Agent

Advanced XMTP agent for automatic tracking of transactions, balances, and gas fees in EVM-compatible blockchains in real-time.

## ✨ Key Features

- 🔔 **Instant notifications** for every transaction with complete details
- 📊 **Automatic history loading** of transactions when adding a wallet
- ⛽ **Accurate gas fee tracking** for each transaction
- 💰 **Balance monitoring** across all supported networks
- 📈 **Statistics** of income/expenses for any period
- 🌐 **Multi-chain**: works with 6+ blockchains simultaneously
- 🔍 **Real-time**: checks new blocks every 12 seconds

## 🌐 Supported Blockchains

- ✅ **Ethereum Mainnet**
- ✅ **Sepolia Testnet** (for testing)
- ✅ **Polygon**
- ✅ **Arbitrum**
- ✅ **Optimism**
- ✅ **Base**

## 🎯 How It Works

1. **Add wallet** → Agent loads last 10,000 blocks of transactions
2. **Monitoring starts** → Checks new blocks every 12 seconds
3. **Transaction found** → Instant notification with details
4. **Statistics** → Request data whenever you need

---

## 📦 Installation and Setup

### 1. Clone and Install

```bash
# Create project directory
mkdir xmtp-transaction-agent
cd xmtp-transaction-agent

# Copy all files from artifacts
# (index.js, package.json, .env.example, generate-key.js)

# Install dependencies
npm install
```

### 2. Environment Variables Setup

**Generate encryption key:**

```bash
npm run generate-key
```

Copy the generated key.

**Create `.env` file:**

```bash
cp .env.example .env
```

**Fill in the variables:**

```env
# Your wallet private key (WITH 0x prefix!)
XMTP_WALLET_KEY=0xyour_private_key_here

# 64-character hex encryption key (from generate-key)
XMTP_DB_ENCRYPTION_KEY=your_64_character_hex_key_here

# XMTP environment (dev for Sepolia Testnet)
XMTP_ENV=dev

# Alchemy API Key
ALCHEMY_API_KEY=
```

### 3. Get Your Private Key

**From Metamask:**
1. Open Metamask
2. Click three dots → **Account details**
3. **Export Private Key**
4. Enter password and copy the key
5. **IMPORTANT**: Add `0x` prefix if it's missing!

⚠️ **Security Warning**: 
- Key format must be: `0xabc123def456...`
- Never share your private key
- Never commit it to GitHub

### 4. Local Testing

```bash
npm start
```

You should see:
```
🚀 Transaction Tracker Agent ЗАПУЩЕН!
📬 Адрес: 0x...
🔗 Тест: https://xmtp.chat/...
⏳ Жду сообщений...
```

---

## 🌟 Deploy to Render.com

### Step 1: Prepare Repository

1. Create a new GitHub repository
2. Add `.gitignore`:
```
node_modules/
.env
*.log
```

3. Push all files (except `.env`):
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Step 2: Create Service on Render

1. Go to [Render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `xmtp-transaction-agent`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid plan)

### Step 3: Configure Environment Variables

In **Environment** section, add these variables:

```
XMTP_WALLET_KEY = 0x_your_private_key_with_prefix
XMTP_DB_ENCRYPTION_KEY = your_64_character_hex_encryption_key
XMTP_ENV = dev
ALCHEMY_API_KEY = mRihUxWF22AZILcoI3b3V
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically deploy your agent
3. Wait for successful deployment
4. Check logs for agent address

---

## 📱 Using the Agent

### Connect to Your Agent

1. Go to [xmtp.chat](https://xmtp.chat)
2. Connect your wallet
3. Copy agent address from Render logs
4. Start a conversation with the agent

### 📝 Available Commands

#### `/start` or `hello`
Initialize conversation and see welcome message

```
👋 Hello! I'm Transaction Tracker Agent!

🎯 I track your transactions in real-time and monitor gas fees.

📝 Commands:
/add <address> - Add wallet
/wallets - My wallets
/balance - Check balances
/stats <period> - Statistics
/history - Transaction history
/help - Detailed help
```

#### `/add <address>`
Add wallet for tracking

**Example:**
```
/add 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Response:**
```
✅ Wallet added!

📍 Address: 0x742d35...
📊 Loaded transactions: 156
🔍 Monitoring started in all networks

🔔 You will now receive notifications for EVERY new transaction!
```

#### `/wallets`
List all tracked wallets

**Response:**
```
💼 Tracked wallets:

1. 0x742d35cc6634c0532925a3b844bc9e7595f0beb
2. 0xabcd1234ef567890abcd1234ef567890abcd1234

🔍 Monitoring: ✅ Active
📊 Transactions in database: 342
```

#### `/balance`
Check balances across all networks

**Response:**
```
💰 BALANCES:

📍 0x742d...0beb
  Ethereum: 1.234567 ETH
  Sepolia Testnet: 5.100000 ETH
  Polygon: 0.500000 MATIC
  Arbitrum: 0.123456 ETH
```

#### `/stats <period>`
View statistics for a period

**Available periods:**
- `today` - Today
- `week` - Last 7 days
- `month` - Last 30 days
- `year` - Last 365 days
- `september`, `october`, `november`, etc. - Specific month

**Example:**
```
/stats september
```

**Response:**
```
📊 STATISTICS FOR SEPTEMBER

📈 Transactions: 42
📥 Received: 2.500000 ETH
📤 Sent: 1.800000 ETH
⛽ Fees: 0.042000 ETH
💵 Net: 0.658000 ETH

✅ Profit
```

#### `/history`
Show last 10 transactions

**Response:**
```
📜 LAST 10 TRANSACTIONS:

1. 📤 Sepolia Testnet
   0.01 ETH
   Fee: 0.000021 ETH
   9/30/2025, 10:23:45 AM
   https://sepolia.etherscan.io/tx/0x123...

2. 📥 Ethereum
   0.5 ETH
   Fee: 0.000000 ETH
   9/29/2025, 3:15:22 PM
   https://etherscan.io/tx/0xabc...
```

#### `/help`
Show detailed help

---

## 🔔 Automatic Notifications

When you make a transaction, the agent automatically sends a notification:

```
🔔 NEW TRANSACTION DETECTED!

📤 Type: Sent
🌐 Network: Sepolia Testnet
💰 Amount: 0.01 ETH
⛽ Fee: 0.000021 ETH
⚡ Gas Used: 21000
💵 Gas Price: 1.5 Gwei

📍 From: 0x742d35cc6634c0532925a3b844bc9e7595f0beb
📍 To: 0xabcd1234ef567890abcd1234ef567890abcd1234

🔗 View:
https://sepolia.etherscan.io/tx/0x123abc...
```

**Notification includes:**
- Transaction type (sent/received)
- Network name
- Amount transferred
- Gas fee spent
- Gas used
- Gas price in Gwei
- Sender and receiver addresses
- Direct link to blockchain explorer

---

## 🛠 Customization

### Adding New Network

Add configuration to `NETWORKS` object in `index.js`:

```javascript
NETWORKS.inkonchain = {
  name: 'INKON Chain',
  rpc: `https://rpc.inkonchain.com/v2/${ALCHEMY_API_KEY}`,
  explorer: 'https://explorer.inkonchain.com',
  chainId: 12345,
  nativeCurrency: 'INKON'
};
```

### Adjust Monitoring Interval

In `monitorWalletRealtime` function, change the interval (default 12 seconds):

```javascript
}, 12000); // Check every 12 seconds
```

For faster monitoring: `}, 6000);` (6 seconds)
For slower: `}, 30000);` (30 seconds)

### Change Transaction History Depth

In `fetchTransactionHistory` function:

```javascript
const fromBlock = Math.max(0, currentBlock - 10000); // Last 10,000 blocks
```

Change `10000` to desired number of blocks.

---

## 🐛 Troubleshooting

### Agent doesn't start

**Check logs on Render:**
1. Open your service on Render
2. Go to **Logs** tab
3. Look for error messages

**Common issues:**

❌ `XMTP_WALLET_KEY env is not in hex (0x) format`
- **Solution**: Add `0x` prefix to your private key

❌ `Malformed 32 byte encryption key`
- **Solution**: Generate new key with `npm run generate-key`

❌ `Cannot connect to RPC`
- **Solution**: Check your Alchemy API key

### Transactions not showing in /history

1. **Check if wallet is added**: `/wallets`
2. **Wait 1-2 minutes** after adding wallet for history to load
3. **Make a test transaction** in Sepolia testnet
4. **Wait 12-24 seconds** for monitoring to detect it
5. **Check logs** on Render for monitoring activity

### Not receiving notifications

1. **Verify monitoring is active**: `/wallets` should show "✅ Active"
2. **Check transaction is on supported network**
3. **Wait at least 12 seconds** after transaction confirmation
4. **Check Render logs** for detection messages

### Balance shows zero

- Some networks may take time to sync
- Check if you have balance on that specific network in Metamask
- Try refreshing: send `/balance` command again

---

## 📚 Technical Details

### Architecture

- **XMTP SDK**: For messaging and notifications
- **Ethers.js v6**: For blockchain interactions
- **Alchemy API**: For reliable RPC and transaction history
- **In-memory storage**: User data and transaction history

### Monitoring Process

1. When wallet is added, agent queries last 10,000 blocks via Alchemy API
2. Starts real-time monitoring loop for each network
3. Every 12 seconds:
   - Fetches current block number
   - Compares with last checked block
   - Scans all new blocks for user transactions
   - Sends notifications for matches

### Data Storage

All data is stored in memory using JavaScript `Map`:
- User wallets list
- Transaction history
- Last checked block numbers
- Monitoring intervals

⚠️ **Note**: Data is lost on restart. For persistent storage, add database integration.

---

## 🔐 Security Best Practices

1. ✅ Never commit `.env` file to Git
2. ✅ Use environment variables on Render
3. ✅ Don't share your private key
4. ✅ Use test wallet for Sepolia testnet
5. ✅ Rotate keys periodically
6. ✅ Monitor Render logs for suspicious activity

---

## 📈 Limitations

### Free Tier Render.com
- Service sleeps after 15 minutes of inactivity
- First message may be delayed due to wake-up
- Limited to 750 hours/month

**Solutions:**
- Upgrade to paid plan ($7/month) for always-on service
- Use external uptime monitor to ping service

### Alchemy Free Tier
- 300M compute units/month
- Should be sufficient for personal use
- Monitor usage in Alchemy dashboard

---

## 🚀 Upgrade Options

### Add Database (PostgreSQL)

For persistent storage of transaction history:

1. Add PostgreSQL service on Render
2. Install `pg` package: `npm install pg`
3. Update code to store data in database instead of memory

### Add More Networks

Simply add RPC endpoints to `NETWORKS` object:

```javascript
avalanche: {
  name: 'Avalanche',
  rpc: `https://avax-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  explorer: 'https://snowtrace.io',
  chainId: 43114,
  nativeCurrency: 'AVAX'
}
```

### Add Token Tracking

Extend to track ERC-20 token transfers:
- Use Alchemy's `getAssetTransfers` with token category
- Parse Transfer events from transaction logs

### Add Price Tracking

Integrate price APIs (CoinGecko, CoinMarketCap) to show:
- USD value of transactions
- Total portfolio value
- P&L in fiat currency

---

## 📞 Support

- **XMTP Docs**: [https://docs.xmtp.org](https://docs.xmtp.org)
- **Alchemy Docs**: [https://docs.alchemy.com](https://docs.alchemy.com)
- **Render Docs**: [https://render.com/docs](https://render.com/docs)
- **Ethers.js Docs**: [https://docs.ethers.org](https://docs.ethers.org)

---

## 📄 License

MIT License - Feel free to modify and use for your projects!

---

## 🎉 Example Usage Flow

1. **Deploy agent to Render** ✅
2. **Open xmtp.chat** and connect wallet
3. **Message agent**: `/start`
4. **Add your wallet**: `/add 0xYourAddress`
5. **Agent loads history**: "Loaded 156 transactions"
6. **Make a test transaction** in Sepolia
7. **Receive instant notification** with details!
8. **Check stats**: `/stats month`
9. **View history**: `/history`

That's it! Your personal blockchain transaction tracker is ready! 🚀
