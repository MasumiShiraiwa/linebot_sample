const axios = require("axios");


/**
 * Send message to a user
 * @async
 * @param {Object} content - Message Content
 *  "content": {
    "type": "text",
    "text": "[message]"
  }
 * 
 * 
 * @param {string} botId - Bot ID
 * @param {string} userId - User ID
 * @param {string} accessToken - Access Token
 * @return {Object} response
 */
let sendMessageToUser = async (content, botId, userId, accessToken) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`
    };

    const res = await axios.post(`https://www.worksapis.com/v1.0/bots/${botId}/users/${userId}/messages`, content,
        { headers }
    );
    return res;
};

