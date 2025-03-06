const { google } = require("googleapis");
const fs = require("fs");

// 環境変数からGoogle Drive認証情報を取得
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"] // ここでスコープを指定
});

// Google Drive APIの初期化
const drive = google.drive({ version: "v3", auth });

let uploadToGoogleDrive = async (botId, fileId, accessToken) => {
    try{
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };

        const res = await axios.get(
            {
                headers: headers,
                maxRedirects: 0, // これを設定しないとリダイレクトが自動で処理されてしまう
                validateStatus: status => status === 302 || (status >= 200 && status < 300)
            }
        );
        console.debug("responce for getting redirect URL: ", res.headers);
          
        if(res.status === 302){
            const downloadUrl = res.headers.location;
            if(!downloadUrl){
                throw new Error("リダイレクト URL が見つかりません");
            }
            console.log("Download URL:", downloadUrl);

            const fileResponse = await axios.get(downloadUrl, {
                headers: headers,
                responseType: "stream"
            });

            // ステータスコードチェック
            if(fileResponse.status < 200 || fileResponse.status >= 300){
                throw new Error(`ファイルダウンロードに失敗しました: ${fileResponse.status}`);
            }

            // ストリームをバッファとして読み込む
            const buffers = [];
            fileResponse.data.on('data', chunk => {
                buffers.push(chunk);
            });

            
            
            
        } else {
            throw new Error(`予期しないステータスコード: ${res.status}`);
        }


    } catch(e){
        console.error("Error upload file: ", e.message);
        if(e.response){
            console.error("HTTP Status:", e.response.status);
            console.error("Response Data:", e.response.data);
        }
        throw e;
    }
};

let downloadFromGoogleDrive = async () => {
    try{

    }catch(e){
        console.error("Error download file: ", e);
    }
};

module.exports = {uploadToGoogleDrive, downloadFromGoogleDrive};