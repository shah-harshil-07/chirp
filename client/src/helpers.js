import * as CONSTANTS from "./constants";

const keyConfig = {
    password: { regex: CONSTANTS.PASSWORD_REGEX, negativeCase: false, errorMessage: CONSTANTS.PASSWORD_ERR_MESSAGE },
    name: { regex: CONSTANTS.NAME_REGEX, negativeCase: false, errorMessage: CONSTANTS.NAME_ERR_MESSAGE },
    username: { regex: CONSTANTS.USERNAME_REGEX, negativeCase: false, errorMessage: CONSTANTS.USERNAME_ERR_MESSAGE },
    email: { regex: CONSTANTS.EMAIL_REGEX, negativeCase: true, errorMessage: CONSTANTS.EMAIL_ERR_MESSAGE },
}

export const validate = (key, data) => {
    if (keyConfig?.[key]) {
        const regex = new RegExp(keyConfig[key].regex);
        const result = regex.test(data);
        return keyConfig[key].negativeCase ? !result : result;
    }

    return false;
}

export const getErrorMessage = key => {
    return keyConfig?.[key]?.errorMessage ?? '';
}
