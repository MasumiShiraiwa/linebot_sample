let axios = require("axios");


let getGroupList = async (accessToken) => {
    const params = {
        domainId: process.env.DOMAIN_ID
    }

    try{
        console.log("send request to get group list");
        const res = await axios.get("https://www.worksapis.com/v1.0/groups", {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            params: params
        })

        console.log("groups: ",res.data.groups);
        return res.data.groups;

    }catch(e){
        console.error("Error getting group list:", e.message);
        if(e.response){
            console.error("HTTP Status:", e.response.status);
            console.error("Response Data:", e.response.data);
        }
    }
};

let getNotePostList = async (groupId, accessToken) => {
    console.log("send request to get note list");
    try{
        const res = await axios.get(`https://www.worksapis.com/v1.0/groups/${groupId}/note/posts`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })

        console.log("res.data: ",res.data);
        console.log("noteList: ",res.data.posts);
        return res.data.posts;
    }catch(e){
        console.error("Error getting note list:", e.message);
        if(e.response){
            console.error("HTTP Status:", e.response.status);
            console.error("Response Data:", e.response.data);
        }
    }
};

let getNotePost = async (groupId, postId, accessToken) => {
    const params = {
        groupId: groupId,
        postId: postId
    }
    console.log("send request to get the note post");
    try{
        const res = await axios.get(`https://www.worksapis.com/v1.0/groups/${groupId}/note/posts/${postId}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            params: params
        })
        return res.data;
    }catch(e){
        console.error("Error getting note post:", e.message);
        if(e.response){
            console.error("HTTP Status:", e.response.status);
            console.error("Response Data:", e.response.data);
        }
    }
};

let postNote = async (groupId, accessToken) => {
    console.log("send request to post note");
    try{

        const requestData = {
            "title": "WORKS 利用案内",
            "body": "<h1> WORKS 利用ガイド </h1>LINE WORKS のご利用に関して以下の通りご案内致します。",
            "enableCollaboration": true,
            "sendNotifications": true,
            "isNotice": false
        };

        const res = await axios.post(`https://www.worksapis.com/v1.0/groups/${groupId}/note/posts`,
            requestData,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        )
        console.log("res.data: ",res.data);
        return res.data;
    }catch(e){
        console.error("Error posting note:", e.message);
        if(e.response){
            console.error("HTTP Status:", e.response.status);
            console.error("Response Data:", e.response.data);
        }
    }
};

module.exports = {
    getGroupList,
    getNotePostList,
    getNotePost,
    postNote
};