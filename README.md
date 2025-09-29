# XMTP Simple Agent

A simple agent on XMTP that responds to "how are you?" in Sepolia (dev).

## Deploy to Render
1. Connect the GitHub repository `xmtp-simple-agent`.
2. Specify the start command: `npm start`.
3. Add environment variables:
   - `XMTP_WALLET_KEY`: Private wallet key (without 0x).
   - `XMTP_DB_ENCRYPTION_KEY`: Random string (32+ characters).
   - `XMTP_ENV`: `dev`.
4. Deploy: `npm install` and `npm start`.

## Testing
- Open [xmtp.chat](https://xmtp.chat), select **Dev** mode.
- Connect MetaMask, find the agent address (from Render logs).
- Send "how are you?" — get a reply!
