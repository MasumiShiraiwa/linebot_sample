let axios = require("axios");


let getGroupList = async (accessToken) => {

    const params = {
        domainId: process.env.DOMAIN_ID
    }

    try{
        const res = await axios.get("https://api.lineworks.net/v1/groups", {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            params: params
        })

        console.log(res.data.groups);
        return ;

    }catch(e){
        console.error("Error getting group list:", e.message);
    }
}


module.exports = {
    getGroupList
}
