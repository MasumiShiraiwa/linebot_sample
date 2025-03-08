let axios = require("axios");


let getGroupList = async (accessToken) => {

    const params = {
        domainId: process.env.DOMAIN_ID
    }
    console.log("in getGroupList");

    try{
        const res = await axios.get("https://api.lineworks.net/v1/groups", {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            params: params
        })

        console.log("groups: ",res.data.groups);
        return res.data.groups;

    }catch(e){
        console.error("Error getting group list:", e.message);
    }
}


module.exports = {
    getGroupList
}
