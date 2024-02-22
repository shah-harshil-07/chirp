import axios from "axios";

const origin = process.env.REACT_APP_SERVER_ORIGIN;
const port = process.env.REACT_APP_SERVER_PORT;

const API = async (method, baseUrl, data, headerData, isSpecialUrl) => {
    const headers = headerData ?? {};
    const validateStatus = status => status <= 422;
    const url = isSpecialUrl ? baseUrl : `${origin}:${port}/${baseUrl}`;

    return new Promise((res, rej) => {
        axios({ url, data, method, headers, validateStatus })
            .then(response => {
                res(response);
            })
            .catch(err => {
                rej(err);
                console.log(err.toJSON());
            });
    });
}

export default API;
