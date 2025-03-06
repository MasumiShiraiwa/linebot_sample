const axios = require("axios");
const XLSX = require("xlsx");
const fileConverter = require("./fileConverter");

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
  
        // リダイレクトURLからファイルをストリームで取得
        const fileResponse = await axios.get(downloadUrl, {
          headers: headers,
          responseType: "stream"
        });

  
        // ステータスコードチェック
        if (fileResponse.status < 200 || fileResponse.status >= 300) {
          throw new Error(`ファイルダウンロードに失敗しました: ${fileResponse.status}`);
        }
        
        // ストリームをバッファとして読み込む
        const buffers = [];
        await new Promise((resolve, reject) => {
            fileResponse.data.on("data", (chunk) => buffers.push(chunk)); // データをバッファに追加
            fileResponse.data.on("end", resolve); // 受信完了
            fileResponse.data.on("error", reject); // エラー処理
        });

        // 🔹 バッファを1つのファイルデータに統合
        const fileBuffer = Buffer.concat(buffers);

        // ファイルをXLSXとして読み込む
        const workbook = XLSX.read(fileBuffer, {type: "buffer"});
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
        console.log("sheetData: ", sheetData, "type: ", typeof(sheetData));
        console.log("sheetData[0]: ", sheetData[0]);

        return await sheetData; // ファイルの内容を配列として返す
  
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