const axios = require("axios");

/**
 * Get user information
 * details : https://developers.worksmobile.com/jp/docs/user-get?lang=ja
 * @async
 * @param {string} userId - User ID
 * @param {string} accessToken - Access Token
 * 
 * @return {Object} response
 */

export let getUserInformation = async (userId, accessToken) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`
    };

    const res = await axios.get(`https://www.worksapis.com/v1.0/users/${userId}`, {headers});

    return res;
}