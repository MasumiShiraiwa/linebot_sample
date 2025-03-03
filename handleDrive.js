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
              validateStatus: status => status === 302 || (status >= 200 && status < 300)
            }
      );

      console.debug("responce for getting redirect URL: ", res.headers);

      // ステータスが 302 の場合のみリダイレクト URL を取得
    if (res.status === 302) {
        const downloadUrl = res.headers.location;
        if (!downloadUrl) {
          throw new Error("リダイレクト URL が見つかりません");
        }
        console.log("Download URL:", downloadUrl);
  
        // リダイレクトURLからファイルを取得
        const fileResponse = await axios.get(downloadUrl, {
          headers: headers,
          responseType: "stream"
        });
  
        // ステータスコードチェック
        if (fileResponse.status < 200 || fileResponse.status >= 300) {
          throw new Error(`ファイルダウンロードに失敗しました: ${fileResponse.status}`);
        }
  
        return fileResponse;
      } else {
        throw new Error(`予期しないステータスコード: ${res.status}`);
      }

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