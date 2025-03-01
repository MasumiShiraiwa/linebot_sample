const axios = require("axios");

/**
 * Download the file sended by a user.
 * @async
 * @param {Object} content - Message Content
 *  "content": {
    "type": "text",
    "text": "[message]"
  }
 * 
 * 
 * @param {string} botId - Bot ID
 * @param {string} fileId - field ID
 * @param {string} accessToken - Access Token
 * @return {Object} fileResponse 
 */

  let uploadToDrive = async (botId, fileId, accessToken) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    //res =  (Found - Location ヘッダーのダウンロード URL にリダイレクト)
    const res = await axios.post(`https://www.worksapis.com/v1.0/bots/${botId}/attachments/${fileId}`, { headers },
    );

    const downloadUrl = res.headers.location;
    if (!downloadUrl) throw new Error("ダウンロード URL が見つかりません");

    const fileResponse = await axios.get(downloadUrl, { responseType: "stream" });

    return fileResponse; // とりあえず、受け取るだけ
  };

  module.exports = {uploadToDrive};