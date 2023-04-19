import axios from "axios";

const origin = process.env.REACT_APP_SERVER_ORIGIN;
const port = process.env.REACT_APP_SERVER_PORT;

const API = async (method, baseUrl, data, headerData, isSpecialUrl) => {
    const requestUrl = isSpecialUrl ? baseUrl : `${origin}:${port}/${baseUrl}`;
    const headers = headerData ?? {};

    try {
        const responseObj = await axios[method](requestUrl, data, { headers });
        return responseObj;
    } catch (error) {
        throw new Error(error);
    }
}

export default API;
