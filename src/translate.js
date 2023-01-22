exports.translate = async (text, target) => {
    const CONFIG = require("../config/config").CONFIG
    let body = {
        "targetLanguageCode": target,
        "format": "PLAIN_TEXT",
        "texts": [
            text
        ]
    }

    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", CONFIG.TRANSLATE.KEY);

    let response = await fetch("https://translate.api.cloud.yandex.net/translate/v2/translate", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
    });
    let result = null

    if (response.status == 200) result = response.json().then(res => res.translations[0].text);
    else result = response.json().then(res => res.code + ": " + res.message);
    return result
}