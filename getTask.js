const axios = require("axios");


let getTaskCategoryList = async (userId, accessToken) => {
    console.log("get task category list");
    const headers = {
        Authorization: `Bearer ${accessToken}`
    };
    try{
        const res = await axios.get(`https://www.worksapis.com/v1.0/users/${userId}/task-categories`, {headers});
        return res.data;
    }catch(e){
        console.error("Error getting task category list:", e.message);
        if(e.response){
            console.error("HTTP Status:", e.response.status);   
            console.error("Response Data:", e.response.data);
        }
    }
}

let getTaskList = async (userId, accessToken) => {
    console.log("get task list");
    console.log("type of userId: ", typeof(userId))
    const headers = {
        Authorization: `Bearer ${accessToken}`
    };
    const params = {
        categoryId: "0" // ここが違う
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

let postTask = async (userId, accessToken) => {
    console.log("post task");
    const headers = {
        Authorization: `Bearer ${accessToken}`
    };
    const params = {
        "assignorId": userId,
        "assignees": [
          {
            "assigneeId": userId,
            "status": "TODO"
          }
        ],
        "title": "週次会議の予定",
        "content": "会議室の予約",
        "dueDate": "2024-05-25",
        "completionCondition": "ANY_ONE",
        "categoryId": "7f5078df-bf67-417c-a559-f5539e59bd0d"
      }
    try{
        const res = await axios.post(`https://www.worksapis.com/v1.0/users/${userId}/tasks`, {params}, {headers});
        return res.data;
    }catch(e){
        console.error("Error posting task:", e.message);
    }
}

module.exports = {
    getTaskCategoryList,
    getTaskList
};