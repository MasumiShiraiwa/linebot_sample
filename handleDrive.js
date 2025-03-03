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
          Authorization: `Bearer ${accessToken}`
      };

      // API からリダイレクトURLを取得
      const res = await axios.get(
          `https://www.worksapis.com/v1.0/bots/${botId}/attachments/${fileId}`,
          {
              headers: headers,
              maxRedirects: 0, // これを設定しないとリダイレクトが自動で処理されてしまう
              validateStatus: status => status >= 200 || status < 300,
          }
      );

      console.debug("responce for getting redirect URL: ", res.headers);
      // リダイレクトURLを取得
      const downloadUrl = res.headers.location;
      if (!downloadUrl) throw new Error("ダウンロード URL が見つかりません");
      console.log("Download URL: ", downloadUrl);

      if (res.status == 302){
        console.log("this can find file")
      }

      // リダイレクトURLからファイルを取得
      const fileResponse = await axios.get(downloadUrl, 
        { 
            headers: headers,
            responseType: "stream" });
      return fileResponse;

  } catch (error) {
    console.error("Error downloading file:", error.message);
    if (error.response) {
        console.error("HTTP Status:", error.response.status);
        console.error("Response Data:", error.response.data);
    }
    throw error;
}
};
  module.exports = {uploadToDrive};