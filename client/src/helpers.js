import Login from "./components/login";
import Register from "./components/register";
import * as CONSTANTS from "./constants";
import ScheduledPostList from "./components/form/scheduled-posts";
import ScheduledPostEditor from "./components/form/scheduled-post-editor";

const dayOfWeekOptions = [], hourOptions = [], minuteOptions = [], dayOfMonthOptions = [];
for (let i = 0; i < 60; i++) {
    const option = { value: i, label: i };

    if (i < 8) dayOfWeekOptions.push(option);
    if (i < 24) hourOptions.push(option);
    if (i <= 28 && i > 0) dayOfMonthOptions.push(option);
    minuteOptions.push(option);
}

const monthOptions = [
    { value: 0, label: "January" }, // index: 0, days: 31
    { value: 1, label: "February" }, // index: 1, days: 28 or 29 depending upon the year
    { value: 2, label: "March" }, // index: 2, days: 31
    { value: 3, label: "April" }, // index: 3, days: 30
    { value: 4, label: "May" }, // index: 4, days: 31
    { value: 5, label: "June" }, // index: 5, days: 30
    { value: 6, label: "July" }, // index: 6, days: 31
    { value: 7, label: "August" }, // index: 7, days: 31
    { value: 8, label: "September" }, // index: 8, days: 30
    { value: 9, label: "October" }, // index: 9, days: 31
    { value: 10, label: "November" }, // index: 10, days: 30
    { value: 11, label: "December" }, // index: 11, days: 31
];

const weekOptions = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];

const keyConfig = {
    password: { regex: CONSTANTS.PASSWORD_REGEX, negativeCase: true, errorMessage: CONSTANTS.PASSWORD_ERR_MESSAGE },
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

export const isUserLoggedIn = () => {
    return localStorage.getItem("chirp-accessToken") ? true : false;
}

export const getDayOfWeekOptions = () => {
    return dayOfWeekOptions;
}

export const getHourOptions = () => {
    return hourOptions;
}

export const getMinuteOptions = () => {
    return minuteOptions;
}

export const getDayOfMonthOptions = (monthIndex, year) => {
    let upperLimit = 0;

    if (monthIndex === 1) {
        upperLimit = (year % 400 === 0 && year % 100 !== 0 && year % 4 === 0) ? 29 : 28;
    } else if (monthIndex <= 6) {
        upperLimit = monthIndex % 2 === 0 ? 31 : 30;
    } else {
        upperLimit = monthIndex % 2 !== 0 ? 31 : 30;
    }

    for (let i = 29; i <= upperLimit; i++) dayOfMonthOptions.push({ value: i, label: i });

    return dayOfMonthOptions;
}

export const getMonthOptions = () => {
    return monthOptions;
}

export const getWeekOptions = () => {
    return weekOptions;
}

export const modalConfig = {
    register: Register,
    login: Login,
    scheduledPosts: ScheduledPostList,
    scheduledPostEditor: ScheduledPostEditor,
}
