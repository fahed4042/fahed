
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// إعداد تطبيق Express
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret_key'; // استبدل بمفتاح سري آمن

// إعداد بوت Telegram
const TELEGRAM_TOKEN = 'YOUR_TELEGRAM_BOT_API_TOKEN';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// قاعدة بيانات وهمية لتخزين المستخدمين (استبدل بقاعدة بيانات حقيقية في الإنتاج)
let users = [];

// إعداد Body Parser
app.use(bodyParser.json());

// تسجيل مستخدم جديد عبر Telegram
bot.onText(/\/register/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please send your email and password in the format: \nEmail:password');
});

bot.onText(/\/login/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please send your email and password in the format: \nEmail:password');
});

bot.onText(/\/login_facebook/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please follow the Facebook login link to authenticate.');
    // أرسل رابط تسجيل الدخول باستخدام فيسبوك
    bot.sendMessage(chatId, 'https://www.facebook.com/v12.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=https://yourdomain.com/callback&response_type=token');
});

bot.onText(/\/login_google/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please follow the Google login link to authenticate.');
    // أرسل رابط تسجيل الدخول باستخدام جوجل
    bot.sendMessage(chatId, 'https://accounts.google.com/o/oauth2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=https://yourdomain.com/callback&response_type=token&scope=email profile');
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (msg.text.includes(':')) {
        const [email, password] = msg.text.split(':');
        
        // تحقق من التسجيل أو تسجيل الدخول
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            // التحقق من كلمة المرور وتسجيل الدخول
            const isPasswordValid = bcrypt.compareSync(password, existingUser.password);
            if (isPasswordValid) {
                const token = jwt.sign({ email: existingUser.email }, JWT_SECRET, { expiresIn: '1h' });
                bot.sendMessage(chatId, `Login successful! Your token: ${token}`);
            } else {
                bot.sendMessage(chatId, 'Invalid email or password.');
            }
        } else {
            // تسجيل مستخدم جديد
            const hashedPassword = bcrypt.hashSync(password, 8);
            users.push({ email, password: hashedPassword });
            bot.sendMessage(chatId, 'Registration successful! You can now log in.');
        }
    }
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
node server.js
