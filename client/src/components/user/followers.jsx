import "src/styles/user/followers.css";

import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import { cilArrowLeft } from "@coreui/icons";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import API from "src/api";
import Loader from "src/components/utilities/loader";
import * as Constants from "src/utilities/constants";
import usePostServices from "src/custom-hooks/post-services";
import { closeConfirmation } from "src/redux/reducers/confirmation";
import useConnectionServices from "src/custom-hooks/connecting-services";
import { getCommonHeader, getUserDetails, isUserLoggedIn } from "src/utilities/helpers";

const UserFollowers = ({ theme, userId, mutuallyConnectedUsers }) => {
    const dispatch = useDispatch(), navigate = useNavigate();
    const externalThemes = ["suggestedUsers", "searchedUsers"];
    const sampleUserImg = require("src/assets/sample-user.png");
    const commonHeader = getCommonHeader(), location = useLocation();
    const { getFinalUserImages, moveToUserPage } = usePostServices();
    const { id: loggedUserId } = isUserLoggedIn() ? getUserDetails() : {};
    const { connectUser, confirmDisconnectUser } = useConnectionServices();

    const [users, setUsers] = useState([]);
    const [userImages, setUserImages] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        applyTheme();
        // eslint-disable-next-line
    }, [theme]);

    const applyTheme = async () => {
        let url = '';

        switch (theme) {
            case "followers":
                url = Constants.FOLLOWER_LIST;
                break;
            case "following":
                url = Constants.FOLLOWING_LIST;
                break;
            case "suggestedUsers":
                url = Constants.GET_SUGGESTED_USERS;
                break;
            case "searchedUsers":
                url = Constants.SEARCH_USER;
                break;
            case "mutualConnection":
                url = null;

                let _userImages = {};
                const _users = mutuallyConnectedUsers?.map((userObj, userIndex) => {
                    const { _id: userId, picture: userPic } = userObj;
                    _userImages[userId] = userPic;

                    return {
                        userId,
                        isFollowed: true,
                        id: userId ?? userIndex,
                        name: userObj?.name ?? '',
                        username: userObj?.username ?? '',
                    };
                }) ?? [];

                setUsers([..._users]);
                const settledUserImages = await getFinalUserImages(_userImages);
                setUserImages({ ...settledUserImages });
                break;
            default:
                break;
        }

        getFollowers(url);
    }

    const getFollowers = async url => {
        if (url) {
            try {
                const formattedUrl = `${url}${userId ? `/${userId}` : ''}`;
                const method = theme === "searchedUsers" ? Constants.POST : Constants.GET;
                const data = theme === "searchedUsers" ? { searchValue: location?.state?.query ?? '' } : null;

                setIsLoading(true);
                const { data: response } = await API(method, formattedUrl, data, commonHeader);
                setIsLoading(false);

                updateUserDataFromResponse(response);
            } catch (error) {
                console.log(error);
                handleDataFetchingError();
            }
        }
    }

    const updateUserDataFromResponse = async response => {
        try {
            const _userImages = {};

            const _users = response?.data?.map((userObj, userIndex) => {
                if (externalThemes.includes(theme)) {
                    const { _id: id, picture: userPic } = userObj ?? {};
                    if (userPic && id) _userImages[id] = userPic;
                    return { ...userObj, id: id ?? userIndex, userId: id };
                } else {
                    const { _id: userId, picture: userPic } = userObj?.user ?? {};
                    if (userPic && userId) _userImages[userId] = userPic;
                    return {
                        userId,
                        id: userObj?._id ?? userIndex,
                        bio: userObj?.user?.bio ?? '',
                        name: userObj?.user?.name ?? '',
                        username: userObj?.user?.username ?? '',
                        isFollowed: userObj?.isFollowed ?? false,
                    };
                }
            }) ?? [];

            setUsers([..._users]);
            const settledUserImages = await getFinalUserImages(_userImages);
            setUserImages({ ...settledUserImages });
        } catch (error) {
            console.log(error);
            handleDataFetchingError();
        }
    }

    const handleDataFetchingError = () => {
        setUsers([]);
        setUserImages({});
        setIsLoading(false);
    }

    const handleConnectingAction = (e, userIndex, isFollowed) => {
        e.stopPropagation();
        const _users = users, userId = users?.[userIndex]?.["userId"] ?? '';

        if (!isFollowed) {
            connectUser(e, userId, true);

            if (_users[userIndex]) {
                _users[userIndex]["isFollowed"] = true;
                setUsers([..._users]);
            }
        } else {
            confirmDisconnectUser(() => {
                connectUser(e, userId, false);
                dispatch(closeConfirmation());

                if (_users[userIndex]) {
                    _users[userIndex]["isFollowed"] = false;
                    setUsers([..._users]);
                }
            });
        }
    }

    const moveToDashboard = () => {
        navigate(-1);
    }

    return isLoading ? <Loader /> : (
        <div className="w-100">
            {
                externalThemes.includes(theme) && (
                    <div className="common-header">
                        <div className="common-heading-icon" onClick={moveToDashboard}>
                            <CIcon width={20} height={20} size="sm" icon={cilArrowLeft} />
                        </div>
                    </div>
                )
            }

            {
                users?.map((userObj, i) => {
                    const { id, name, username, isFollowed, userId, bio } = userObj;

                    return (
                        <div key={id} className="user-follower-box" onClick={e => { moveToUserPage(e, userId); }}>
                            <div className="row ml-0 mr-0 user-follower-head">
                                <div className="col-2 user-follower-imgbox">
                                    <img
                                        alt="user"
                                        className="user-follower-img"
                                        src={userImages[userId] ?? String(sampleUserImg)}
                                        onError={e => { e.target.src = String(sampleUserImg); }}
                                    />
                                </div>

                                <div className="col-8 pl-0">
                                    <span className="fw-bold font-size-20">{name}</span>
                                    <br />
                                    <span>{username}</span>
                                </div>

                                {
                                    (theme !== "searchedUsers" && (userId !== loggedUserId || theme === "suggestedUsers")) && (
                                        <div
                                            title={`click to ${isFollowed ? "unfollow" : "follow"}`}
                                            onClick={e => { handleConnectingAction(e, i, isFollowed); }}
                                            className={`
                                                col-2
                                                user-follower-action-btn
                                                ${isFollowed ? "user-follower-following-btn" : "user-follower-follows-btn"}
                                            `}
                                        >
                                            <b>{isFollowed ? "Following" : "Follow"}</b>
                                        </div>
                                    )
                                }
                            </div>

                            <div className="row ml-0 mr-0">
                                <div className="col-2 user-follower-bio" />
                                <div className="col-10">
                                    {bio?.slice(0, 130) ?? ''}
                                    {bio?.length > 130 ? "..." : ''}
                                </div>
                            </div>
                        </div>
                    );
                })
            }
        </div>
    )
};

export default UserFollowers;
