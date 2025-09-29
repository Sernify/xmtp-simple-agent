# XMTP Agent для Render.com

Простой XMTP агент, который отвечает на сообщения в сети XMTP.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните следующие переменные:

- **XMTP_WALLET_KEY**: Приватный ключ вашего кошелька (без префикса `0x`)
- **XMTP_DB_ENCRYPTION_KEY**: Ключ шифрования (минимум 32 символа, например: `my-super-secret-encryption-key-123`)
- **XMTP_ENV**: `dev` (для Sepolia Testnet)
- **ALCHEMY_RPC_URL**: Уже настроен для Sepolia

### 3. Локальный запуск

```bash
npm start
```

## 📦 Деплой на Render.com

### Шаг 1: Подготовка репозитория

1. Создайте новый репозиторий на GitHub
2. Загрузите все файлы проекта (кроме `.env`)
3. Добавьте `.env` в `.gitignore`

### Шаг 2: Создание сервиса на Render

1. Зайдите на [Render.com](https://render.com)
2. Нажмите **"New +"** → **"Web Service"**
3. Подключите ваш GitHub репозиторий
4. Настройте сервис:
   - **Name**: `xmtp-agent` (или любое другое имя)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (или платный план)

### Шаг 3: Настройка переменных окружения

В разделе **Environment** добавьте переменные:

```
XMTP_WALLET_KEY = ваш_приватный_ключ
XMTP_DB_ENCRYPTION_KEY = ваш_ключ_шифрования_32_символа
XMTP_ENV = dev
ALCHEMY_RPC_URL = https://eth-sepolia.g.alchemy.com/v2/mRihUxWF22AZILcoI3b3V
```

### Шаг 4: Деплой

1. Нажмите **"Create Web Service"**
2. Render автоматически задеплоит ваш агент
3. Дождитесь успешного деплоя

## 🔑 Получение приватного ключа

### Metamask:
1. Откройте Metamask
2. Нажмите на три точки → **Account details**
3. **Export Private Key**
4. Введите пароль и скопируйте ключ

⚠️ **Важно**: Никогда не делитесь приватным ключом и не загружайте его в GitHub!

## 🧪 Тестирование агента

1. После запуска скопируйте адрес агента из логов
2. Перейдите на [xmtp.chat](https://xmtp.chat)
3. Подключите кошелек
4. Отправьте сообщение на адрес агента
5. Агент должен ответить!

## 📝 Примеры сообщений

- "Привет" → Агент поздоровается
- "Как дела?" → Агент ответит о своем состоянии
- "Помощь" → Агент расскажет, что умеет
- Любое другое сообщение → Агент повторит ваше сообщение

## 🛠 Кастомизация

Отредактируйте `index.js` для добавления своей логики:

```javascript
agent.on('text', async (ctx) => {
  const message = ctx.message.content;
  
  // Ваша логика здесь
  await ctx.sendText('Ваш ответ');
});
```

## 📚 Полезные ссылки

- [XMTP Documentation](https://docs.xmtp.org)
- [XMTP Agent SDK](https://github.com/xmtp/xmtp-node-js-tools)
- [xmtp.chat](https://xmtp.chat) - тестовая площадка
- [Render.com Docs](https://render.com/docs)

## 🐛 Отладка

Посмотрите логи на Render:
1. Откройте ваш сервис на Render
2. Перейдите во вкладку **Logs**
3. Проверьте сообщения об ошибках

## ⚡ Важные заметки

- Используйте `dev` окружение для Sepolia Testnet
- Для Production используйте `XMTP_ENV=production`
- На Free плане Render сервис может засыпать после 15 минут неактивности
- Первое сообщение может идти дольше из-за пробуждения сервиса
