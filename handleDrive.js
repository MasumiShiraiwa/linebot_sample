const axios = require("axios");
const XLSX = require("xlsx");

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
  
        // リダイレクトURLからファイルをストリームで取得
        const fileResponse = await axios.get(downloadUrl, {
          headers: headers,
          responseType: "stream"
        });

        console.log("fileResponse.data: ", fileResponse.data);
  
        // ステータスコードチェック
        if (fileResponse.status < 200 || fileResponse.status >= 300) {
          throw new Error(`ファイルダウンロードに失敗しました: ${fileResponse.status}`);
        }
        
        // ストリームをバッファとして読み込む
        const buffers = [];
        fileResponse.data.on('data', chunk => {
            buffers.push(chunk);
        });

        // ストリームの読み込み完了後、バッファを結合して返す
        const promise = new Promise((resolve, reject) => {
            fileResponse.data.on('end', () => {
            const fileBuffer = Buffer.concat(buffers);
            resolve(fileBuffer);
            });
            fileResponse.data.on('error', reject);
        });

        // ファイルをXLSXとして読み込む
        const workbook = XLSX.read(fileBuffer, {type: "buffer"});
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
        console.log("sheetData: ", sheetData);

        return await promise; // ファイルの内容をバッファとして返す
  
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