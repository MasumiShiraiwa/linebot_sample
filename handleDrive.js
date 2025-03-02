const axios = require("axios");

/**
 * Download the file from a redirected URL.
 * @async
 * @param {string} botId - Bot ID
 * @param {string} fileId - File ID
 * @param {string} accessToken - Access Token
 * @return {Object} fileResponse - File stream response
 */

let uploadToDrive = async (botId, fileId, accessToken) => {
  try {
      const headers = {
          Authorization: `Bearer ${accessToken}`,
      };

      // API からリダイレクトURLを取得
      const res = await axios.get(
          `https://www.worksapis.com/v1.0/bots/${botId}/attachments/${fileId}`,
          { headers }
      );

      console.debug("responce for getting redirect URL: ", res);

      // リダイレクトURLを取得
      const downloadUrl = res.headers.location;
      if (!downloadUrl) throw new Error("ダウンロード URL が見つかりません");
      console.log("doenload URL: ", downloadUrl);

      // リダイレクトされたURLからファイルを取得
      const fileResponse = await axios.get(downloadUrl, { responseType: "stream" });

      return fileResponse; // ファイルストリームを返す
  } catch (error) {
      console.error("Error downloading file:", error.message);
      throw error;
  }
};
  module.exports = {uploadToDrive};