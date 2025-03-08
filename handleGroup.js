let axios = require("axios");


let getGroupList = async (accessToken) => {

    const params = {
        domainId: process.env.DOMAIN_ID
    }
    console.log("in getGroupList");

    try{
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
}

let getNoteList = async (accessToken, groupId) => {
    const params = {}
    try{
        const res = await axios.get(`https://www.worksapis.com/v1.0/groups/${groupId}/note/posts`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            params: params
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
}


module.exports = {
    getGroupList,
    getNoteList
}
