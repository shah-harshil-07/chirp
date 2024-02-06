import "src/styles/user/followers.css";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import useToaster from "src/custom-hooks/toaster-message";

import API from "src/api";
import Loader from "src/components/utilities/loader";
import * as Constants from "src/utilities/constants";
import usePostServices from "src/custom-hooks/post-services";
import useConnectionServices from "src/custom-hooks/connecting-services";
import { closeConfirmation, openConfirmation } from "src/redux/reducers/confirmation";
import { getCommonHeader, getUserDetails, isUserLoggedIn } from "src/utilities/helpers";

const UserFollowers = ({ theme, userId, mutuallyConnectedUsers }) => {
    const { showError } = useToaster();
    const commonHeader = getCommonHeader();
    const { connectUser } = useConnectionServices();
    const { getImageFetchingPromise } = usePostServices();
    const dispatch = useDispatch(), navigate = useNavigate();
    const sampleUserImg = require("src/assets/sample-user.png");
    const { id: loggedUserId } = isUserLoggedIn() ? getUserDetails() : {};

    const [users, setUsers] = useState([]);
    const [userImages, setUserImages] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        applyTheme();
        // eslint-disable-next-line
    }, [theme]);

    const applyTheme = () => {
        let url = '';

        switch (theme) {
            case "followers":
                url = Constants.FOLLOWER_LIST;
                break;
            case "following":
                url = Constants.FOLLOWING_LIST;
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
                updatedUserImages(_userImages);
                break;
            default:
                break;
        }

        getFollowers(url);
    }

    const getFollowers = async url => {
        if (url && userId) {
            setIsLoading(true);
            const { data: response } = await API(Constants.GET, `${url}/${userId}`, null, commonHeader);
            setIsLoading(false);

            const _userImages = {};

            const _users = response?.data?.map(userObj => {
                const { _id: userId, picture: userPic } = userObj?.user ?? {};

                if (userPic) _userImages[userId] = userPic;

                return {
                    userId,
                    id: userObj?._id ?? '',
                    bio: userObj?.user?.bio ?? '',
                    name: userObj?.user?.name ?? '',
                    username: userObj?.user?.username ?? '',
                    isFollowed: userObj?.isFollowed ?? false,
                };
            }) ?? [];

            setUsers([..._users]);
            updatedUserImages(_userImages);
        }
    }

    const updatedUserImages = async _userImages => {
        for (const userId in _userImages) {
            const imageValue = _userImages[userId];
            if (!imageValue.startsWith(Constants.httpsOrigin)) {
                await getImageFetchingPromise(imageValue, imageData => { _userImages[userId] = imageData; }, "user");
            }
        }

        setUserImages({ ..._userImages });
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
            const confirmationProps = {
                headingText: "Unfollow",
                message: "Are you sure you want to unfollow the user?",
                handleConfirmAction: () => {
                    connectUser(e, userId, false);
                    dispatch(closeConfirmation());

                    if (_users[userIndex]) {
                        _users[userIndex]["isFollowed"] = false;
                        setUsers([..._users]);
                    }
                }
            };

            dispatch(openConfirmation(confirmationProps));
        }
    }

    const moveToUserPage = userId => {
        if (userId) navigate(`/user/${userId}`);
        else showError("User id is unavaiable.");
    }

    return isLoading ? <Loader /> : users?.map((userObj, i) => {
        const { id, name, username, isFollowed, userId, bio } = userObj;

        return (
            <div key={id} className="user-follower-box" onClick={() => { moveToUserPage(userId); }}>
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
                        userId !== loggedUserId && (
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
    });
};

export default UserFollowers;
