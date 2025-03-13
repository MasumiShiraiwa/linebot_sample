const { google } = require("googleapis");


const SCOPES = [`https://www.googleapis.com/auth/drive.file`]

let authorize = async () => {
    const auth = new google.auth.GoogleAuth({
        scopes: SCOPES,
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY
        }
    });
    const drive = google.drive({version: "v3", auth});
    return drive;
}

let getListOfFiles = async () => {
    const drive = await authorize();
    const params = {pageSize: 100}
    const res = await drive.files.list(params);
    console.log(res.data.files);
    return res.data.files;
}

let uploadToDrive = async (botId, fileId, accessToken) => {
    const drive = await authorize();
    const file = await drive.files.get({fileId: fileId});
    return file;
}

module.exports = {uploadToDrive, getListOfFiles};