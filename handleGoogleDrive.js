const { google } = require("googleapis");


const SCOPES = [`https://www.googleapis.com/auth/drive.metadata.readonly`]

let authorize = async () => {
    console.log("GOOGLE_CLIENT_EMAIL:", process.env.GOOGLE_CLIENT_EMAIL);
    console.log("GOOGLE_PRIVATE_KEY exists:", !!process.env.GOOGLE_PRIVATE_KEY);

    console.log("--------------------------------");
    console.log("Get Access Token");
    // JWT認証
    // const auth_JWT = new google.auth.JWT(
    //     process.env.GOOGLE_CLIENT_EMAIL,
    //     null,
    //     process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // 改行処理
    //     SCOPES
    // );
    
    // クライアントシークレット
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

let getExcelFile = async (fileId) => {
    const drive = await authorize();
    let file;
    try{
        file = await drive.files.get({fileId: fileId});
    }catch(err){
        console.log(err);
        return null;
    }

    // ストリームをバッファとして読み込む
    const buffers = [];
    await new Promise((resolve, reject) => {
        file.data.on('data', (chunk) => buffers.push(chunk));
        file.data.on('end', resolve);
        file.data.on('error', reject);
    });

    // バッファを1つのファイルデータに統合
    const fileBuffer = Buffer.concat(buffers);

    // ファイルをXLSXとして読み込む
    const workbook = XLSX.read(fileBuffer, {type: "buffer"});
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
    console.log("sheetData: ", sheetData, "type: ", typeof(sheetData));
    console.log("sheetData[0]: ", sheetData[0]);

    return sheetData; // 一時的にファイルの内容を配列として返す

}

let postTextFile = async (text) => {
    
}

module.exports = {getListOfFiles, getExcelFile, postTextFile};