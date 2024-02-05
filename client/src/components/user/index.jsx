import "src/styles/user/index.css";

import CIcon from "@coreui/icons-react";
import { cilArrowLeft } from "@coreui/icons";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "src/api";
import UserInfo from "./info";
import UserPosts from "./posts";
import UserFollowers from "./followers";
import * as Constants from "src/utilities/constants";
import useToaster from "src/custom-hooks/toaster-message";
import usePostServices from "src/custom-hooks/post-services";
import { getCommonHeader, getUserDetails, isUserLoggedIn } from "src/utilities/helpers";

const UserDetails = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const headerData = getCommonHeader();
    const { showError, showSuccess } = useToaster();
    const { getImageFetchingPromise } = usePostServices();
    const loggedInUserData = isUserLoggedIn() ? getUserDetails() : {};
    const { id: loggedUserId } = loggedInUserData;

    const [theme, setTheme] = useState("posts");
    const [isLoading, setIsLoading] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [mutuallyConnectedUserList, setMutuallyConnectedUserList] = useState([]);

    useEffect(() => {
        getUserData().catch(moveBack);
        window.scrollTo(0, 0);
        getMutualConnections();
        // eslint-disable-next-line
    }, [userId]);

    const getUserData = async () => {
        setIsLoading(true);
        const response = await API(Constants.GET, `${Constants.GET_USER_DETAILS}/${userId}`, headerData);
        const responseData = response?.data ?? {};

        if (responseData?.meta?.status && responseData?.data) {
            const userData = responseData.data;
            setUserDetails({ ...userData });

            const pictureSuccessCallback = imageData => {
                userData["profile"] = userData["picture"];
                userData["picture"] = imageData;
                setUserDetails({ ...userData });
            }

            if (userData?.picture && !userData?.picture?.startsWith(Constants.httpsOrigin)) {
                getImageFetchingPromise(userData.picture, pictureSuccessCallback, "user");
            }

            const bgImgSuccessCallback = imageData => {
                userData["back"] = userData["backgroundImage"];
                userData["backgroundImage"] = imageData;
                setUserDetails({ ...userData });
            }

            if (userData?.backgroundImage && !userData?.backgroundImage?.startsWith(Constants.httpsOrigin)) {
                getImageFetchingPromise(userData.backgroundImage, bgImgSuccessCallback, "user");
            }
        } else {
            moveBack();
        }

        setIsLoading(false);
    }

    const getMutualConnections = () => {
        if (loggedUserId && userId) {
            const url = `${Constants.GET_MUTUAL_CONNECTIONS}/${userId}`;
            API(Constants.GET, url, null, headerData).then(({ data: response }) => {
                const users = response?.data ?? [];
                setMutuallyConnectedUserList([...users]);
            });
        }
    }

    const moveBack = () => {
        navigate(-1);
    }

    const applyTheme = _theme => {
        setTheme(_theme);
    }

    const applyPostTheme = () => {
        setTheme("posts");
    }

    const followUnfollowUser = (e, followingId, followUser) => {
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

    return (
        <div>
            <div className="common-header" id="user-header-box">
                <div
                    className="common-heading-icon"
                    onClick={() => { if (theme !== "posts") applyPostTheme(); else moveBack(); }}
                >
                    <CIcon width={20} height={20} size="sm" icon={cilArrowLeft} />
                </div>

                <div className="common-heading-text">
                    {userDetails?.name ?? ''}
                    <div id="user-header-sub-text">
                        {
                            theme === "posts" ? (
                                <>{userDetails?.totalPosts ?? 0} post{userDetails?.totalPosts > 1 ? 's' : ''}</>
                            ) : theme === "followers" ? (
                                <>{userDetails?.followers ?? 0} follower{userDetails?.followers > 1 ? 's' : ''}</>
                            ) : theme === "following" ? (
                                <>{userDetails?.following ?? 0} following</>
                            ) : (
                                <></>
                            )
                        }
                    </div>
                </div>
            </div>

            {
                theme === "followers" || theme === "following" ? (
                    <UserFollowers theme={theme} userId={userId} followUnfollowAction={followUnfollowUser} />
                ) : (
                    <>
                        <UserInfo
                            details={userDetails}
                            isLoading={isLoading}
                            getterFn={getUserData}
                            changeTheme={applyTheme}
                            followUnfollowAction={followUnfollowUser}
                            mutuallyConnectedUsers={mutuallyConnectedUserList}
                        />

                        <UserPosts userId={userId} />
                    </>
                )
            }
        </div>
    );
};

export default UserDetails;
