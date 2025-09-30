XMTP Transaction Tracker Agent

An advanced XMTP agent for tracking transactions, balances, and fees in EVM-compatible blockchains.

🎯 Features

✅ Track multiple wallets

🔔 Instant transaction notifications

📊 Income/expense statistics by period

⛽ Fee tracking

💰 Balance checks across all networks

📜 Transaction history


🌐 Supported Networks

Ethereum Mainnet

Sepolia Testnet

Polygon

Arbitrum

Optimism

Base


🚀 Quick Start

1. Install dependencies

npm install  
  
2. Configure environment variables  
  
Generate an encryption key:  
  
npm run generate-key  
  
Copy the generated key.  
  
Create a .env file based on .env.example:  
  
cp .env.example .env  
  
Fill in the following variables:  
  
XMTP_WALLET_KEY: Your wallet’s private key WITH the 0x prefix (e.g., 0xabc123...)  
  
XMTP_DB_ENCRYPTION_KEY: 32-byte hex encryption key. Generate with npm run generate-key  
  
XMTP_ENV: dev (for Sepolia Testnet)  
  
ALCHEMY_RPC_URL: Already set for Sepolia  
  
  
3. Local run  
  
npm start  
  
📦 Deploy to Render.com  
  
Step 1: Prepare repository  
  
1. Create a new GitHub repository  
  
  
2. Upload all project files (except .env)  
  
  
3. Add .env to .gitignore  
  
  
  
Step 2: Create service on Render  
  
1. Go to Render.com  
  
  
2. Click "New +" → "Web Service"  
  
  
3. Connect your GitHub repository  
  
  
4. Configure service:  
  
Name: xmtp-agent (or any name)  
  
Environment: Node  
  
Build Command: npm install  
  
Start Command: npm start  
  
Instance Type: Free (or paid plan)  
  
  
  
  
Step 3: Configure environment variables  
  
XMTP_WALLET_KEY = 0x_your_private_key_with_prefix  
XMTP_DB_ENCRYPTION_KEY = your_64_char_hex_key_from_generate-key  
XMTP_ENV = dev  
ALCHEMY_RPC_URL = https://eth-sepolia.g.alchemy.com/v2/mRihUxWF22AZILcoI3b3V  
  
Step 4: Deploy  
  
1. Click "Create Web Service"  
  
  
2. Render will automatically deploy your agent  
  
  
3. Wait for successful deployment  
  
  
  
🔑 Getting a Private Key  
  
Metamask:  
  
1. Open Metamask  
  
  
2. Click the three dots → Account details  
  
  
3. Export Private Key  
  
  
4. Enter password and copy the key  
  
  
5. IMPORTANT: Add 0x to the start of the key if missing!  
  
  
  
⚠️ Important:  
  
Key format must be: 0xabc123def456...  
  
Never share your private key or upload it to GitHub!  
  
  
🧪 Testing the Agent  
  
1. After starting, copy the agent’s address from logs  
  
  
2. Go to xmtp.chat  
  
  
3. Connect your wallet  
  
  
4. Send a message to the agent’s address  
  
  
  
📝 Main Commands  
  
/start - Start working with the agent  
/add 0xYourAddress - Add wallet to track  
/wallets - List your wallets  
/balance - Check balances across networks  
/stats month - Monthly statistics  
/stats september - Statistics for September  
/history - Recent transaction history  
/help - Help  
  
💡 Usage Examples  
  
1. Add a wallet:  
  
/add 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb  
  
2. Monthly statistics:  
  
/stats month  
  
The agent will show:  
  
Number of transactions  
  
Total received funds  
  
Total sent funds  
  
Fees spent  
  
Net balance change  
  
  
3. Statistics for September:  
  
/stats september  
  
4. Check balances:  
  
/balance  
  
The agent will show balances across all supported networks.  
  
📊 Notifications  
  
The agent automatically sends a notification when a new transaction is detected:  
  
🔔 New transaction detected!  
  
Network: Ethereum  
Type: 📤 Sent  
Amount: 0.1 ETH  
Fee: 0.0021 ETH  
From: 0x742d35...  
To: 0xabcd123...  
Hash: 0x123abc...  
Explorer: https://etherscan.io/tx/0x123abc...  
  
🛠 Customization  
  
Adding a new network  
  
In index.js, add configuration to the NETWORKS object:  
  
NETWORKS.inkonchain = {  
  name: 'INKON Chain',  
  rpc: 'https://rpc.inkonchain.com',  
  explorer: 'https://explorer.inkonchain.com'  
};  
  
Adjust monitoring interval  
  
In monitorWallet function, change interval (default 15 seconds):  
  
}, 15000); // Check every 15 seconds  
  
📚 Useful Links  
  
XMTP Documentation  
  
XMTP Agent SDK  
  
xmtp.chat - testing ground  
  
Render.com Docs  
  
  
🐛 Debugging  
  
Check logs on Render:  
  
1. Open your service on Render  
  
  
2. Go to Logs tab  
  
  
3. Check error messages  
  
  
  
⚡ Important Notes  
  
Use dev environment for Sepolia Testnet  
  
For Production use XMTP_ENV=production  
  
On Render Free plan, the service may sleep after 15 minutes of inactivity  
  
The first message may take longer due to service wake-up

