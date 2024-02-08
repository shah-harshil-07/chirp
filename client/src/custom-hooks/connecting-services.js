import API from "src/api";
import useToaster from "./toaster-message";
import * as Constants from "src/utilities/constants";
import { getCommonHeader, getUserDetails, isUserLoggedIn } from "src/utilities/helpers";

const useConnectionServices = () => {
    const loggedInUserData = isUserLoggedIn() ? getUserDetails() : {};
    const { id: loggedUserId } = loggedInUserData;

    const headerData = getCommonHeader();
    const { showError, showSuccess } = useToaster();

    const connectUser = (e, followingId, followUser) => {
        if (e) e.preventDefault();
        showError("message");

        if (loggedUserId && followingId) {
            const baseUrl = followUser ? Constants.FOLLOW_USER : Constants.UNFOLLOW_USER;
            const url = `${baseUrl}/${followingId}`;

            API(Constants.GET, url, null, headerData).then(({ data: response }) => {
                const { status, message } = response?.meta ?? {};

                if (status && message) showSuccess(message);
                else showError(message ?? "Something went wrong!");
            });
        } else {
            showError("Please login to follow.");
        }
    }

    const getMutualConnections = (userId, updateFn) => {
        if (loggedUserId && userId && loggedUserId !== userId) {
            const url = `${Constants.GET_MUTUAL_CONNECTIONS}/${userId}`;
            API(Constants.GET, url, null, headerData).then(({ data: response }) => {
                const users = response?.data ?? [];
                updateFn([...users]);
            });
        }
    }

    return { connectUser, getMutualConnections };
};

export default useConnectionServices;
