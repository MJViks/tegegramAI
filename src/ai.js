const { Configuration, OpenAIApi } = require("openai");
const CONFIG = require("../config/config").CONFIG
const configuration = new Configuration({
    apiKey: CONFIG.AI.API_KEY,
});
const openai = new OpenAIApi(configuration);

//Формирование ответа AI
exports.getAI = async (msg) => {
    let myMsg = msg.replace("\\", '\\\\')
    CONFIG.AI.OPTIONS.prompt = myMsg
    const resAI = await openai.createCompletion(CONFIG.AI.OPTIONS)
    const answer = resAI.data.choices[0].text.replace("\\", '\\\\').replace("/", '//');
    return answer
}