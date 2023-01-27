const CONFIG = require("../config/config").CONFIG
const translate = require("./translate").translate
const TelegramBot = require('node-telegram-bot-api');
const getAI = require("./ai").getAI

//Инициализация API
const bot = new TelegramBot(CONFIG.TELEGRAM.API_KEY, { polling: true });
bot.setMyCommands(CONFIG.TELEGRAM.COMMANDS);

const help = (chatId, bot) => {
  let helpText = `*Доступные команды:*\n\n`;
  helpText += CONFIG.TELEGRAM.COMMANDS.map(
    (command) => `*/${command.command}* ${command.description}`
  ).join(`\n`);
  return bot.sendMessage(chatId, helpText, {
    parse_mode: "Markdown",
  });
};

//Заглушка
bot.onText(/(\/[a-zA-Z]{1,})$/, (msg, match) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, `\`\`\`${match[1]}\`\`\``,
    {
      parse_mode: "Markdown",
    });
})

//ai
bot.onText(/\/ai (.+)/, async (msg, match) => {
  //Формирование ответа AI
  const chatId = msg.chat.id;
  try {
    const myMsgRu = msg.text.replace(/\/ai /, '')
    const myMsgEn = await translate(myMsgRu, "en")
    const resAIEn = await getAI(myMsgEn)
    const resAIRu = await translate(resAIEn, "ru")

    const answer = 'Ваш вопрос:\n' + myMsgRu + '\n\n' + 'Ответ:' + resAIRu
    // Отправляем предсказание пользователю
    bot.sendMessage(chatId, answer.toString(), { parse_mode: "Markdown" });
  } catch (ex) {
    bot.sendMessage(chatId, 'Ошибка\n' + ex);
    console.log(ex);
  }
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
  bot.sendMessage(chatId, 'Сейчас установлены следующие настройки:\n\n' +
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
bot.onText(/\/tEn/, async (msg, match) => {
  const chatId = msg.chat.id;
  let myMsg = msg.text.replace(/\/tEn /, '').replace("\\", '\\\\')

  await translate(myMsg, 'en').then((response) => {
    bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
  }).catch((error) => {
    // Обрабатываем ошибку
    bot.sendMessage(chatId, 'Ошибка переводчика');
    console.log(JSON.stringify(error));
  });
})