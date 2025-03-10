const express = require('express');
const jwt = require('jsonwebtoken');
const { setTimeout } = require('timers/promises');

const lineworks = require("./lineworks");
const getUserInfo = require("./getUserInfo");
const handleDrive = require("./handleDrive");
const handleGroup = require("./handleGroup");
const getTask = require("./getTask");

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
const ownerEmail = "14262@donnguri"

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


const decodeAccessToken = (accessToken) => {
    try {
        const decoded = jwt.decode(accessToken);
        console.log("Decoded Access Token:", decoded);
        if (decoded && decoded.scope) {
            console.log("Token Scope:", decoded.scope);
        } else {
            console.log("Scope information not found in token.");
        }
    } catch (error) {
        console.error("Failed to decode access token:", error);
    }
};



app.post('/callback', verifyBody, async (req, res, next) => {
    const clientId = process.env.LW_API_CLIENT_ID
    const clientSecret = process.env.LW_API_CLIENT_SECRET
    const serviceAccount = process.env.LW_API_SERVICE_ACCOUNT
    const privatekey = process.env.LW_API_PRIVATEKEY
    const botId = process.env.LW_API_BOT_ID

    const scope = "group.note, bot, user.read, task"
    // const scope = "bot, bot.read, bot.message, user.read, group.read, group.note, group.note.read"
    
    const body = req.body;
    console.debug("Get message body", body)

    if (!global_data.hasOwnProperty("access_token")) {
        // Get access token
        console.debug("Get access token");
        const accessToken = await lineworks.getAccessToken(clientId, clientSecret, serviceAccount, privatekey, scope);
        global_data["access_token"] = accessToken
        console.log("access token: ", accessToken);
    }

    // アクセストークン取得後にデコードして確認
    decodeAccessToken(global_data["access_token"]);


    const senderId = body.source.userId
    const rst = await getUserInfo.getUserInformation(senderId, global_data["access_token"] )
    const userEmail = rst.data.email;
    
    let content = {
        content: body.content
    }

    /**
     * 受信したメッセージの"送信者"と"メッセージタイプ"をもとに、処理を分ける
     */
    // 管理者からファイルを送られた場合
    if (content.content.type == "file" && userEmail == ownerEmail){
        //Excel Fileの取得と検証？ファイル名から月を判別する？
        const res = await handleDrive.uploadToDrive(botId, content.content.fileId, global_data["access_token"]);
        
        if(true){
            content = {
                content: {
                    type: "text",
                    text: JSON.stringify(res)
                }
            }
        }
    }else if(content.content.type == "text" && userEmail == ownerEmail){
        const groupList = await handleGroup.getGroupList(global_data["access_token"]);
        const taskList = await getTask.getTaskList(senderId, global_data["access_token"]);
        const res = await handleGroup.postNote(groupList[0].groupId, global_data["access_token"]);
        // const res = await handleGroup.postNote(groupList[0].groupId, global_data["access_token"]);
        // const notePostList = await handleGroup.getNotePostList(groupList[0].groupId, global_data["access_token"]);
        // const notePost = await handleGroup.getNotePost("68d2b697-7c8d-4799-32d5-042944f3671", notePostList[0].postId, global_data["access_token"]);
        content = {
            content: {
                type: "text",
                text: JSON.stringify(res)
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

    for (let i = 0; i < RETRY_COUNT_MAX; i++) {
        console.debug("Try ", i + 1)
        try {
            // Send message
            console.debug("Send message", content)

            const rst = await lineworks.sendMessageToUser(content, botId, senderId, global_data["access_token"])
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
app.post("/remind", async (req, res, next) => {
    const body = req.body;
    console.debug("Get message body", body)


});