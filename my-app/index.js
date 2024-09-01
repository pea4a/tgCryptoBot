const token ='7364297848:AAHmC5-xgl6Hw0KwGtceLmEzdh-VdDvkuvQ';
const TelegramBot = require('node-telegram-bot-api');
const webAppUrl = 'https://main--mellifluous-tanuki-144778.netlify.app';
const bot = new TelegramBot(token, {polling: true});



bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if(text=== '/start'){
    await bot.sendMessage( chatId, 'розпочніть шифрування',{
        reply_markup:{
            inline_keyboard:[
                [{text:'розпочати шифрування', web_app:  {url: webAppUrl}}]
            ]
        }
    })
  }

});