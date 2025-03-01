const { google } = require("googleapis");
const fs = require("fs");

// 環境変数からGoogle Drive認証情報を取得
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"]
});


const drive = google.drive({ version: "v3", auth });

let uploadToDrive = async () => {
    try{

    } catch(e){
        console.error("Error upload file: ", e);
    }
};

let downloadFromDrive = async () => {
    try{

    }catch(e){
        console.error("Error download file: ", e);
    }
};

module.exports = {uploadToDrive, downloadFromDrive};