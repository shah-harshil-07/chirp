import axios from "axios";

const origin = process.env.REACT_APP_SERVER_ORIGIN;
const port = process.env.REACT_APP_SERVER_PORT;

const API = async (method, baseUrl, data, headerData, isSpecialUrl) => {
    const url = isSpecialUrl ? baseUrl : `${origin}:${port}/${baseUrl}`;
    const headers = headerData ?? {};

    try {
        return await axios({ url, data, method, headers });
    } catch (error) {
        throw new Error(error);
    }
}

export default API;
