const express = require('express');
const { setTimeout } = require('timers/promises');

const lineworks = require("./lineworks");
const getUserInfo = require("./getUserInfo");

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

let global_data = {}
const RETRY_COUNT_MAX = 5


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


app.post('/callback', verifyBody, async (req, res, next) => {
    const clientId = process.env.LW_API_CLIENT_ID
    const clientSecret = process.env.LW_API_CLIENT_SECRET
    const serviceAccount = process.env.LW_API_SERVICE_ACCOUNT
    const privatekey = process.env.LW_API_PRIVATEKEY
    const botId = process.env.LW_API_BOT_ID

    const scope = "bot,bot.read,user.read"
    
    const body = req.body;
    console.debug("Get message body", body)

    if (!global_data.hasOwnProperty("access_token")) {
        // Get access token
        console.debug("Get access token");
        const accessToken = await lineworks.getAccessToken(clientId, clientSecret, serviceAccount, privatekey, scope);
        global_data["access_token"] = accessToken
    }

    const senderId = body.source.userId
    const rst = await getUserInfo.getUserInformation(senderId, accessToken)
    console.log(rst);
    const userEmail = rst.data.email;


    const content = {
        content: body.content
    }


    for (let i = 0; i < RETRY_COUNT_MAX; i++) {
        console.debug("Try ", i + 1)
        try {
            // Send message
            console.debug("Send message", content)

            if(userEmail == "14262@donnguri"){
                console.log("sender is masumi!!")
                const rst = await lineworks.sendMessageToUser(content, botId, "14421@donnguri", global_data["access_token"])    
                console.debug("Success sending message to designated user", rst.status)
                res.send("success")
                break
            }else{
                console.log("sender is not masumi!!")
            }

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

