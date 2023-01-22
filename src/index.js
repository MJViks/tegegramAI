const CONFIG = require("../config/config").CONFIG
const translate = require("./translate").translate
const TelegramBot = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require("openai");

//Инициализация API
const bot = new TelegramBot(CONFIG.TELEGRAM.API_KEY, { polling: true });
bot.setMyCommands(CONFIG.TELEGRAM.COMMANDS);

const configuration = new Configuration({
  apiKey: CONFIG.AI.API_KEY,
});
const openai = new OpenAIApi(configuration);


const help = (chatId, bot) => {
  let helpText = `*Доступные команды:*\n\n`;
  helpText += CONFIG.TELEGRAM.COMMANDS.map(
    (command) => `*/${command.command}* ${command.description}`
  ).join(`\n`);
  return bot.sendMessage(chatId, helpText, {
    parse_mode: "Markdown",
  });
};

//Формирование ответа AI
const getAI = async (msg) =>{
  const chatId = msg.chat.id;
  let myMsg = msg.text.replace(/\/ai /, '').replace("\\",'\\\\')

  myMsg = translate(myMsg, "en").then(res => res)

  CONFIG.AI.OPTIONS.prompt = myMsg
  // Отправляем запрос на предсказание с помощью GPT-3
  await openai.createCompletion(CONFIG.AI.OPTIONS).then((response) => {
    // Обрабатываем ответ
    let prediction = 'Ваш вопрос:\n' + myMsg + '\n\n' + 'Ответ:' + response.data.choices[0].text.replace("\\",'\\\\').replace("/",'//');;

    prediction = translate(prediction, "ru").then(res => res)
    // Отправляем предсказание пользователю
    bot.sendMessage(chatId, prediction, {parse_mode: "Markdown"});
  }).catch((error) => {
    // Обрабатываем ошибку
    bot.sendMessage(chatId, 'Ошибка');
    console.log(JSON.stringify(error));
  });
}

//Переводчик на английский
const translateEn = async (msg) =>{
  const chatId = msg.chat.id;
  let myMsg = msg.text.replace(/\/tEn /, '').replace("\\",'\\\\')

  await translate(myMsg, 'en').then((response) => {
    bot.sendMessage(chatId, response, {parse_mode: "Markdown"});
  }).catch((error) => {
    // Обрабатываем ошибку
    bot.sendMessage(chatId, 'Ошибка переводчика');
    console.log(JSON.stringify(error));
  });
}

//Заглушка
bot.onText(/(\/[a-zA-Z]{1,})$/, (msg, match) => {
	const chatId = msg.chat.id
  bot.sendMessage(chatId, `\`\`\`${match[1]}\`\`\``, 
  {
    parse_mode: "Markdown",
  });
})

//ai
bot.onText(/\/ai (.+)/, (msg, match) => {
	getAI(msg)
})

//help
bot.onText(/\/help/, (msg, match) => {
	const chatId = msg.chat.id
	help(chatId, bot)
})

//model
bot.onText(/\/model (.+)/, (msg, match) => {
	const chatId = msg.chat.id
  CONFIG.AI.OPTIONS.model = match[1]
  bot.sendMessage(chatId, 'model установлен как: ' + match[1]);
})

//max_tokens
bot.onText(/\/max_tokens (.+)/, (msg, match) => {
	const chatId = msg.chat.id
  CONFIG.AI.OPTIONS.max_tokens = parseFloat(match[1])
  bot.sendMessage(chatId, 'max_tokens установлен как: ' + match[1]);
})

//temperature
bot.onText(/\/temperature (.+)/, (msg, match) => {
	const chatId = msg.chat.id
  CONFIG.AI.OPTIONS.temperature = parseFloat(match[1])
  bot.sendMessage(chatId, 'temperature установлен как: ' + match[1]);
})

//frequency_penalty
bot.onText(/\/frequency_penalty (.+)/, (msg, match) => {
	const chatId = msg.chat.id
  CONFIG.AI.OPTIONS.frequency_penalty = parseFloat(match[1])
  bot.sendMessage(chatId, 'frequency_penalty установлен как: ' + match[1]);
})

//top_p
bot.onText(/\/top_p (.+)/, (msg, match) => {
	const chatId = msg.chat.id
  CONFIG.AI.OPTIONS.top_p = parseFloat(match[1])
  bot.sendMessage(chatId, 'top_p установлен как: ' + match[1]);
})

//options
bot.onText(/\/options/, (msg, match) => {
	const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Сейчас установлены следующие настройки:\n\n'+
  '*model*: ' + CONFIG.AI.OPTIONS.model + '\n' + 
  '*max_tokens*: ' + CONFIG.AI.OPTIONS.max_tokens + '\n' + 
  '*temperature*: ' + CONFIG.AI.OPTIONS.temperature + '\n' + 
  '*frequency_penalty*: ' + CONFIG.AI.OPTIONS.frequency_penalty + '\n' + 
  '*top_p*: ' + CONFIG.AI.OPTIONS.top_p, 
  {
    parse_mode: "Markdown",
  });
})

//tEn
bot.onText(/\/tEn/, (msg, match) => {
  translateEn(msg)
})