import axios from "axios";

const origin = process.env.REACT_APP_SERVER_ORIGIN;

const API = async (method, baseUrl, data, headerData, isSpecialUrl, signal) => {
    const headers = headerData ?? {};
    const validateStatus = status => status <= 422;
    const url = isSpecialUrl ? baseUrl : `${origin}/${baseUrl}`;

    return new Promise((res, rej) => {
        axios({ url, data, method, headers, validateStatus, signal })
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
