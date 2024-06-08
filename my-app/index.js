const token ='7364297848:AAHmC5-xgl6Hw0KwGtceLmEzdh-VdDvkuvQ';
const TelegramBot = require('node-telegram-bot-api');
const webAppUrl = 'https://google.com';
const bot = new TelegramBot(token, {polling: true});



bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if(text=== '/start'){
    await bot.sendMessage( chatId, 'заповніть форму',{
        reply_markup:{
            inline_keyboard:[
                [{text:'розпочати шифрування', web_app:  {url: webAppUrl}}]
            ]
        }
    })
  }

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});