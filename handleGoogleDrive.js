const { google } = require("googleapis");


const SCOPES = [`https://www.googleapis.com/auth/drive.metadata.readonly`]

let authorize = async () => {
    console.log("GOOGLE_CLIENT_EMAIL:", process.env.GOOGLE_CLIENT_EMAIL);
    console.log("GOOGLE_PRIVATE_KEY exists:", !!process.env.GOOGLE_PRIVATE_KEY);

    console.log("--------------------------------");
    console.log("Get Access Token");
    // const auth = new google.auth.JWT(
    //     process.env.GOOGLE_CLIENT_EMAIL,
    //     null,
    //     process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // 改行処理
    //     SCOPES
    // );
    

    // const drive = google.drive({version: "v3", auth});
    const auth = new google.auth.GoogleAuth({
        scopes: SCOPES,
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
        },
    });
    
    const authClient = await auth.getClient();
    const drive = google.drive({version: "v3", auth: authClient});


    return drive;
}

let getListOfFiles = async () => {
    const drive = await authorize();
    const params = {pageSize: 100}
    console.log("Get List of Files");
    try{
        const res = await drive.files.list(params);
        console.log(res.data.files);
        return res.data.files;
    }catch(err){
        console.log(err);
        return [];
    }
}

let uploadToDrive = async (botId, fileId, accessToken) => {
    const drive = await authorize();
    const file = await drive.files.get({fileId: fileId});
    return file;
}

module.exports = {uploadToDrive, getListOfFiles};