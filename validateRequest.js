/**
 * 
 * トークルームで発生したイベントにより、Callbackイベントのリクエストを受け取った後、
 * Request headerの X-WORKS-Signature によって渡される署名(signature)と、
 * Developer ConsoleのBot画面で発行されている "Bot Secret"(環境変数) を用いて、Request bodyの改ざんチェックを行う。
 */

var crypto = require("crypto");


let safeCompare = (a, b) => {
    if (a.length !== b.length) {
        return false;
    }
    return crypto.timingSafeEqual(a, b);
};


/**
 * Validate request
 * @param {Object} body - Request Body
 * @param {string} signature - value of X-WORKS-Signature header
 * @param  {string} botSecret - Bot Secret
 * @return {boolean} is valid
 */
let validateRequest = (body, signature, botSecret) => {
    // HASH(body, BOT_SECRET)とSignatureを比較する
    return safeCompare(
        crypto.createHmac("SHA256", botSecret).update(body).digest(),
        Buffer.from(signature, "base64"),
    );
};

module.exports = {validateRequest};