const express = require('express');
const jwt = require('jsonwebtoken');
const { setTimeout } = require('timers/promises');

const lineworks = require("./lineworks");
const handleMessage = require("./handleMessage");
const getUserInfo = require("./getUserInfo");
const handleDrive = require("./handleDrive");
const handleGroup = require("./handleGroup");
const handleGoogleDrive = require("./handleGoogleDrive");
const fileConverter = require("./fileConverter");
const { totalmem } = require('os');
const { send } = require('process');

const PORT = process.env.PORT || 3000;
let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, function () {
    console.log("App start on port", PORT);
    // console.log(process.env.PORT)
    // console.log(process.env.LW_API_CLIENT_ID)
    // console.log(process.env.LW_API_BOT_SECRET)
    // console.log(process.env.LW_API_CLIENT_SECRET)
    // console.log(process.env.LW_API_SERVICE_ACCOUNT)
    // console.log(process.env.LW_API_BOT_ID)
    // console.log(process.env.LW_API_PRIVATEKEY)
})

// Global variable
let global_data = {}
const RETRY_COUNT_MAX = 5
const domainEmail = "@donnguri"
const ownerEmail = "14262@donnguri"
const developerEmail = "14262@donnguri"

// Env variable

const clientId = process.env.LW_API_CLIENT_ID
const clientSecret = process.env.LW_API_CLIENT_SECRET
const serviceAccount = process.env.LW_API_SERVICE_ACCOUNT
// const privatekey = process.env.LW_API_PRIVATEKEY // Rneder.comの場合
const privatekey = process.env.LW_API_PRIVATEKEY.replace(/\\n/g, '\n'); // ローカルサーバの場合
const botId = process.env.LW_API_BOT_ID

const scope = "group.note, group.read, bot, bot.message, user.read, task"


let verifyBody = (req, res, next) => {
    const botSecret = process.env.LW_API_BOT_SECRET;
    const body = JSON.stringify(req.body);
    const signature = req.get("x-works-signature");

    console.debug("Received Headers:", req.headers); // 追加
    console.debug("Signature:", signature); // 追加
    console.debug("Bot Secret:", botSecret); // 追加

    if (!signature || !botSecret) {
        console.error("Missing required headers or bot secret.");
        return res.status(400).send({ error: "Missing required headers or bot secret." });
    }

    const rst = lineworks.validateRequest(body, signature, botSecret);
    if (rst == true) {
        console.debug("Verify OK")
        next();
    } else {
        console.debug("Verify NG");
        res.status(400).send({ error: "Invalid signature" });
    }
};

let getAccessToken = async () => {
    if (!global_data.hasOwnProperty("access_token")) {
        // Get access token
        console.debug("Get access token");
        const accessToken = await lineworks.getAccessToken(clientId, clientSecret, serviceAccount, privatekey, scope);
        global_data["access_token"] = accessToken
        console.log("access token: ", accessToken);
    }
    return;
}



app.post('/callback', verifyBody, async (req, res, next) => {
    await getAccessToken();

    const body = req.body;
    console.debug("Get message body", body)

    const senderId = body.source.userId
    console.log("senderId: ", senderId)
    const rst = await getUserInfo.getUserInformation(senderId, global_data["access_token"] )
    const userEmail = rst.data.email;
    
    let recivedContent = {
        content: body.content
    }

    /**
     * 受信したメッセージの"送信者"と"メッセージタイプ"をもとに、処理を分ける
     */
    // 管理者からファイルを送られた場合
    if (recivedContent.content.type == "file" && userEmail == ownerEmail){
        //Excel Fileの取得と検証？ファイル名から月を判別する？
        const res = await handleDrive.uploadToDrive(botId, recivedContent.content.fileId, global_data["access_token"]);
        
        if(true){
            content = {
                content: {
                    type: "text",
                    text: JSON.stringify(res)
                }
            }
        }
    }else if(userEmail == ownerEmail && recivedContent.content.type == "text" && recivedContent.content.text == "シフト更新"){
        const fileList = await handleGoogleDrive.getListOfFiles();
        const month = new Date().getMonth() + 1;
        let shiftFileId = undefined;
        let fileName = ["NEWoMan新宿" + String(month) + "月シフト" + ".xlsx", "NEWoMan新宿" + (String(month).replace(/[0-9]/g, m => ['０','１','２','３','４','５','６','７','８','９','１０','１１','１２'][m])) + "月シフト" + ".xlsx"];
        for (let i = 0; i < fileList.length; i++){
            console.log(fileName, fileList[i].name)
            if(fileName.includes(fileList[i].name)){
                console.log(String(month), "月分のシフト表を取得できました。");
                shiftFileId = fileList[i].id;
            }
        };
        if(shiftFileId == null){
            console.log(fileName + "が見つかりません")
            return;
        }
        const excelData = await handleGoogleDrive.getExcelFile(shiftFileId);
        // const excelData = await handleGoogleDrive.getExcelFile("1CaszqlFQy9h6nbKNoV0itUY-QvCMbrn8");
        const textData = fileConverter.excelToTxt(excelData);
        console.log(process.env.GOOGLE_DRIVE_NB_FOLDER_ID);
        const res = await handleGoogleDrive.postJsonFile(process.env.GOOGLE_DRIVE_NB_FOLDER_ID, textData, "NEWoMan新宿" + String(month) + "月シフト");
        // const res = await handleGoogleDrive.postJsonFile("1qK_iDeV9NL0-fBNGbzEE_KJ0EORChgjz", textData);
        
        
        
        // const listOfFiles = await handleGoogleDrive.getListOfFiles();
        // const groupList = await handleGroup.getGroupList(global_data["access_token"]);
        // const taskCategoryList = await getTask.getTaskCategoryList(senderId, global_data["access_token"]);
        // const taskList = await getTask.getTaskList(senderId, global_data["access_token"]);
        // const res = await handleGroup.postNote(groupList[0].groupId, global_data["access_token"]);
        // const res = await handleGroup.postNote(groupList[0].groupId, global_data["access_token"]);
        // const notePostList = await handleGroup.getNotePostList(groupList[0].groupId, global_data["access_token"]);
        // const notePost = await handleGroup.getNotePost("68d2b697-7c8d-4799-32d5-042944f3671", notePostList[0].postId, global_data["access_token"]);
        content = {
            content: {
                type: "text",
                text: JSON.stringify(textData)
                // text: JSON.stringify(notePostList) + "\n" + JSON.stringify(notePost)
                // text: "Excelファイルを送信してください。\nファイルを送信しても受付完了メッセージが届かなかった場合は、再度ファイルを送信してください。"
            }
        }
    }else{
        content = {
            content: {
                type: "text",
                text: "メッセージを受け付けておりません。不明点があれば、白岩まで。"
            }
        }
    }
    // メッセージ送信処理
    for (let i = 0; i < RETRY_COUNT_MAX; i++) {
        console.debug("Try ", i + 1)
        try {
            // Send message
            console.debug("Send message", content)

            const rst = await handleMessage.sendMessageToUser(content, botId, senderId, global_data["access_token"])
            console.debug("Success sending message", rst.status)
            res.send("success")
            break
        } catch (error) {
            if (error.response) {
                const errStatus = error.response.status
                const errBody = error.response.data
                if (errStatus == 401) {
                    if (errBody["code"] == "UNAUTHORIZED") {
                        // Get access token
                        console.debug("Update access token")
                        const accessToken = await lineworks.getAccessToken(clientId, clientSecret, serviceAccount, privatekey, scope)
                        global_data["access_token"] = accessToken
                    } else {
                        res.status(500).send({ errorMsg: error.message })
                        break
                    }
                } else if (errStatus == 429) {
                    // Over rate limit
                    console.debug("Over rate limit. Retry.")
                } else {
                    console.error(error.message, errBody, errStatus)
                    res.status(500).send({ errorMsg: error.message })
                    break
                }
            } else {
                console.error(error.message)
                res.status(500).send({ errorMsg: error.message })
                break
            }

            await setTimeout(2 ** i);
        }
    }
});


// GASからのリクエストを受ける
// 【要変更】 REST_APIに則ってResponseを返す
//  メッセージの送信に失敗したときを考える
app.post("/remind", async (req, res, next) => {
    let remindList = [];
    let sendErrorList = []; // return 用

    // 明日の日付を取得
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const month = tomorrow.getMonth() + 1;
    const date = tomorrow.getDate();
    const date_idx = date - 1;

    // const body = req.body;
    // console.debug("Get request body", body)

    try{
        
        //認証情報の取得
        await getAccessToken();

        const fileList = await handleGoogleDrive.getListOfFiles();

        let jsonFileId = undefined;
        let fileName = ["NEWoMan新宿" + month + "月シフト" + ".json", "NEWoMan新宿" + (String(month).replace(/[0-9]/g, m => ['０','１','２','３','４','５','６','７','８','９','１０','１１','１２'][m])) + "月シフト" + ".json"];
        for (let i = 0; i < fileList.length; i++){
            console.log(fileName, fileList[i].name)
            if(fileName.includes(fileList[i].name)){
                console.log(String(month), "月分のJsonファイルを取得できました。");
                jsonFileId = fileList[i].id;
            }
        };

        if (!jsonFileId) {
            let errorMessage = "該当するJSONファイルが見つかりませんでした。"
            try{
                const rst = await handleMessage.sendErrorToDevelopper(errorMessage, botId, developerEmail, global_data["access_token"]);
                console.debug("Developer notified successfully", rst.status);
            } catch (error) {
                console.error("Failed to notify developer:", error.message);
            }
            res.status(404).json({ error: errorMessage });
            return;
        }
        const jsonData = await handleGoogleDrive.getJsonFile(jsonFileId);

        if(!jsonData){
            let errorMessage = "Drive上のJSONファイルが空です。"
            try{
                const rst = await handleMessage.sendErrorToDevelopper(errorMessage, botId, developerEmail, global_data["access_token"]);
                console.debug("Developer notified successfully", rst.status);
            } catch (error) {
                console.error("Failed to notify developer:", error.message);
            }
            res.status(404).json({ error: errorMessage });
            return;
        }


        remindList = jsonData[date_idx]; 

        if(!remindList){ //
            let errorMessage = "明日"+ date + "のシフトリストを取得できません。";
            try{
                const rst = await handleMessage.sendErrorToDevelopper(errorMessage, botId, developerEmail, global_data["access_token"]);
                console.debug("Developer notified successfully", rst.status);
            } catch (error) {
                console.error("Failed to notify developer:", error.message);
            }
            res.status(404).json({ error: errorMessage });
            return;
        }
        
        for(let i=0; i<remindList.length; i++){
            let id = remindList[i].id;
            let time = remindList[i].time;

            let content = {
                content: {
                    type: "text",
                    text: "明日" + tomorrow.toLocaleDateString() + "は「" + time + "」での出勤です。\nよろしくおねがいします。"
                }
            }

            for (let j = 0; j < RETRY_COUNT_MAX; j++) {
                console.debug("Try ", j + 1)
                try {
                    // Send message
                    console.debug("Send message", content)
                    const rst = await handleMessage.sendMessageToUser(content, botId, id + domainEmail, global_data["access_token"])
                    console.debug("Success sending message", rst.status)
                    break
                } catch (error) {
                    // debug用
                    if (error.response) {
                        const errStatus = error.response.status
                        const errBody = error.response.data
                        if (errStatus == 401) {
                            if (errBody["code"] == "UNAUTHORIZED") {
                                // Get access token
                                console.debug("Update access token");
                                await getAccessToken();
                            }
                        } else if (errStatus == 429) {
                            // Over rate limit
                            console.debug("Over rate limit. Retry.");
                        }
                    }else{
                        console.error(error.message);
                    }

                    if (j === RETRY_COUNT_MAX - 1){
                        sendErrorList.push({"id":id, "time":time});
                    }
                    // 適切なエラー処理を追加
                    // await setTimeout(2 ** j);
                    await new Promise(res => setTimeout(res, 2 ** j * 1000));
                }
            }
        }

        if (sendErrorList.length === 0) {
            return res.status(200).json({ message: "All messages sent successfully", data: remindList });
        } else {
            // 206: 一部失敗 (Partial Content)

            // 開発者へ通知
            const errorMessage = `送信に失敗したリスト:\n${JSON.stringify(sendErrorList, null, 2)}`;
            try {
                const rst = await handleMessage.sendErrorToDevelopper(errorMessage, botId, developerEmail, global_data["access_token"]);
                console.debug("Developer notified successfully", rst.status);
            } catch (error) {
                console.error("Failed to notify developer:", error.message);
            }
            return res.status(206).json({ message: "Some messages failed to send", failed: sendErrorList });
        }
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }


});