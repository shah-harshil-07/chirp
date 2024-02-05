import { useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";

import API from "src/api";
import Loader from "src/components/utilities/loader";
import * as Constants from "src/utilities/constants";
import { closeConfirmation, openConfirmation } from "src/redux/reducers/confirmation";
import { getCommonHeader, getUserDetails, isUserLoggedIn } from "src/utilities/helpers";
import usePostServices from "src/custom-hooks/post-services";

const UserFollowers = ({ theme, userId, followUnfollowAction }) => {
    const dispatch = useDispatch();
    const commonHeader = getCommonHeader();
    const { getImageFetchingPromise } = usePostServices();
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
                    name: userObj?.user?.name ?? '',
                    username: userObj?.user?.username ?? '',
                    isFollowed: userObj?.isFollowed ?? false,
                };
            }) ?? [];

            for (const userId in _userImages) {
                const imageValue = _userImages[userId];
                if (!imageValue.startsWith(Constants.httpsOrigin)) {
                    await getImageFetchingPromise(imageValue, imageData => { _userImages[userId] = imageData; }, "user");
                }
            }

            setUserImages({ ..._userImages });

            setUsers([..._users]);
        }
    }

    const handleConnectingAction = (e, userIndex, isFollowed) => {
        const _users = users, userId = users?.[userIndex]?.["userId"] ?? '';

        if (!isFollowed) {
            followUnfollowAction(e, userId, true);

            if (_users[userIndex]) {
                _users[userIndex]["isFollowed"] = true;
                setUsers([..._users]);
            }
        } else {
            const confirmationProps = {
                headingText: "Unfollow",
                message: "Are you sure you want to unfollow the user?",
                handleConfirmAction: () => {
                    followUnfollowAction(e, userId, false);
                    dispatch(closeConfirmation());

                    if (_users[userIndex]) {
                        _users[userIndex]["isFollowed"] = true;
                        setUsers([..._users]);
                    }
                }
            };

            dispatch(openConfirmation(confirmationProps));
        }
    }

    return isLoading ? <Loader /> : users?.map((userObj, i) => {
        const { id, name, username, isFollowed, userId } = userObj;

        return (
            <React.Fragment key={id}>
                {i === 0 && <hr />}
                <div className="row ml-0 mr-0">
                    <div className="col-2">
                        <img
                            alt="user"
                            src={userImages[userId] ?? String(sampleUserImg)}
                            onError={e => { e.target.src = String(sampleUserImg); }}
                            style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover" }}
                        />
                    </div>

                    <div className="col-8" style={{ paddingTop: "10px", paddingLeft: '0' }}>
                        <span style={{ fontWeight: "bolder", fontSize: "20px" }}>{name}</span>
                        <br />
                        <span>{username}</span>
                    </div>

                    {
                        userId !== loggedUserId && (
                            <div
                                className="col-2"
                                title={`click to ${isFollowed ? "unfollow" : "follow"}`}
                                id={isFollowed ? "user-info-profile-editor-btn" : "user-info-follow-btn"}
                                style={{ height: "36px", marginTop: "16px", textAlign: "center", paddingLeft: '0', paddingRight: '0' }}
                                onClick={e => { handleConnectingAction(e, i, isFollowed); }}
                            >
                                <b>{isFollowed ? "Following" : "Follow"}</b>
                            </div>
                        )
                    }
                </div>
                <hr />
            </React.Fragment>
        );
    });
};

export default UserFollowers;
