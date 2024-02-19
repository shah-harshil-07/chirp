import Login from "../components/login";
import Register from "../components/register";
import * as CONSTANTS from "./constants";
import ProfileEditor from "src/components/user/profile-editor";
import RepostEditor from "src/components/reactions/repost-editor";
import ScheduledPostList from "../components/form/scheduled-posts";
import CommentEditor from "src/components/reactions/comment-editor";
import ScheduledPostEditor from "../components/form/scheduled-post-editor";

const keyConfig = {
    password: { regex: CONSTANTS.PASSWORD_REGEX, negativeCase: true, errorMessage: CONSTANTS.PASSWORD_ERR_MESSAGE },
    name: { regex: CONSTANTS.NAME_REGEX, negativeCase: false, errorMessage: CONSTANTS.NAME_ERR_MESSAGE },
    username: { regex: CONSTANTS.USERNAME_REGEX, negativeCase: false, errorMessage: CONSTANTS.USERNAME_ERR_MESSAGE },
    email: { regex: CONSTANTS.EMAIL_REGEX, negativeCase: true, errorMessage: CONSTANTS.EMAIL_ERR_MESSAGE },
}

const MAX_DISPLAY_LENGTH = 12;

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

export const getCommonHeader = () => {
    const accessToken = localStorage.getItem("chirp-accessToken");
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export const getUserDetails = () => {
    const userData = localStorage.getItem("chirp-userDetails"), len = MAX_DISPLAY_LENGTH;
    if (userData) {
        let { name, picture, username, _id } = JSON.parse(userData);
        name = name.length > len ? `${name.slice(0, len)}...` : name;
        username = username.length > len ? `${username.slice(0, len)}...` : username;
        return { name, username, picture, id: _id };
    }

    return null;
}

export const modalConfig = {
    login: Login,
    register: Register,
    repostEditor: RepostEditor,
    profileEditor: ProfileEditor,
    commentEditor: CommentEditor,
    scheduledPosts: ScheduledPostList,
    scheduledPostEditor: ScheduledPostEditor,
}

export const checkContainerInViewport = rectObj => {
    return (
        rectObj.top >= 0 &&
        rectObj.left >= 0 &&
        rectObj.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rectObj.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

export const userTabs = [
    { label: "Posts", parentName: "user" },
    { label: "Comments", parentName: "comments" },
    { label: "Saved", parentName: "saved" },
]
