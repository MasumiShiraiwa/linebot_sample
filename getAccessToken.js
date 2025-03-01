const jwt = require('jsonwebtoken');
const axios = require("axios");

/**
 * Generate JWT for access token
 * @param {string} clientId - Client ID
 * @param {string} serviceAccount - Service Account
 * @param {string} privatekey - Private Key
 * @return {string} JWT
 */
let getJWT = (clientId, serviceAccount, privatekey) => {
    current_time = Date.now() / 1000;
    iss = clientId;
    sub = serviceAccount;
    iat = current_time;
    exp = current_time + (60 * 60); // 1 hour

    jws = jwt.sign(
        {
            "iss": iss,
            "sub": sub,
            "iat": iat,
            "exp": exp
        }, privatekey, {algorithm: "RS256"});

    return jws;
};


/**
 * Get Access Token
 * @async
 * @param {string} clientId - Client ID
 * @param {string} clientSecret - Client Secret
 * @param {string} serviceAccount - Service Account
 * @param {string} privatekey - Private Key
 * @param {string} scope - OAuth Scope
 * @return {string} Access Token
 */
export let getAccessToken = async (clientId, clientSecret, serviceAccount, privatekey, scope) => {
    const jwt = getJWT(clientId, serviceAccount, privatekey);

    const params = new URLSearchParams({
        assertion: jwt,
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope,
    });

    const res = await axios.post("https://auth.worksmobile.com/oauth2/v2.0/token", params);

    const accessToken = res.data.access_token;

    return accessToken;
};

