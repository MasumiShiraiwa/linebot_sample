const axios = require("axios");


let getTaskList = async (userId, accessToken) => {
    console.log("get task list");
    const headers = {
        Authorization: `Bearer ${accessToken}`
    };
    const params = {
        categoryId: "0"
    }
    try{
        const res = await axios.get(`https://www.worksapis.com/v1.0/users/${userId}/tasks`, {headers, params: params});
        return res.data;
    }catch(e){
        console.error("Error getting task list:", e.message);
        if(e.response){
            console.error("HTTP Status:", e.response.status);   
            console.error("Response Data:", e.response.data);
        }
    }
};

module.exports = {
    getTaskList
};