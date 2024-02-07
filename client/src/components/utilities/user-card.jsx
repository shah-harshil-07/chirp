import "src/styles/user/info.css";
import "src/styles/utilities/user-card.css";

import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import API from "src/api";
import DisplayedText from "./displayed-text";
import * as Constants from "src/utilities/constants";
import useToaster from "src/custom-hooks/toaster-message";
import { closeDetailsCard } from "src/redux/reducers/user-details";
import MutualConnections from "src/components/user/mutual-connections";
import useConnectionServices from "src/custom-hooks/connecting-services";
import { closeConfirmation, openConfirmation } from "src/redux/reducers/confirmation";
import { checkContainerInViewport, getCommonHeader, getUserDetails, isUserLoggedIn } from "src/utilities/helpers";

const UserCard = () => {
    const { showError } = useToaster();
    const dispatch = useDispatch(), navigate = useNavigate();
    const cardRef = useRef(null), commonHeader = getCommonHeader();
    const userDetailState = useSelector(state => state.userDetails);
    const sampleUserImg = require("src/assets/sample-user.png");
    const userData = userDetailState?.data ?? {};
    let { left, top } = userData?.coordinates ?? {};
    const { connectUser, getMutualConnections } = useConnectionServices();
    const { id: loggedUserId } = isUserLoggedIn() ? getUserDetails() : {};

    const [finalTop, setFinalTop] = useState(top);
    const [finalLeft, setFinalLeft] = useState(left);
    const [isFollowing, setIsFollowing] = useState(false);
    const [mutuallyConnectedUsers, setMutuallyConnectedUsers] = useState([]);

    useEffect(() => {
        setFinalTop(top);
        setFinalLeft(left);

        const { data: userData } = userDetailState ?? {};
        const { _id: userId } = userData ?? {};
        checkUserFollowing(userId);
        getMutualConnections(userId, setMutuallyConnectedUsers);
        // eslint-disable-next-line
    }, [userDetailState]);

    useLayoutEffect(() => {
        const cardRect = cardRef?.current?.getBoundingClientRect() ?? null;
        if (cardRect && !checkContainerInViewport(cardRect)) {
            const { height } = cardRect;
            setFinalTop(top - height);
            // eslint-disable-next-line
            top -= height + 100;
        }

        // eslint-disable-next-line
    }, []);

    const checkUserFollowing = userId => {
        if (userId && userId !== loggedUserId) {
            const url = `${Constants.CHECK_USER_FOLLOWING}/${userId}`;

            API(Constants.GET, url, null, commonHeader).then(({ data: response }) => {
                let { follows } = response?.data ?? {};
                if (typeof follows !== "boolean") follows = Boolean(follows);
                setIsFollowing(follows);
            });
        }
    }

    const closeUserCard = () => {
        dispatch(closeDetailsCard());
    }

    const moveToUserPage = (e, theme = "posts") => {
        closeUserCard();
        e.stopPropagation();

        if (userData?._id) navigate(`/user/${userData._id}`, { state: { theme } });
        else showError("user id is unavailable.");
    }

    const handleUnfollowAction = e => {
        const confirmationProps = {
            headingText: "Unfollow",
            message: "Are you sure you want to unfollow the user?",
            handleConfirmAction: () => {
                setIsFollowing(false);
                dispatch(closeConfirmation());
                connectUser(e, userData._id, false);
            }
        };

        dispatch(openConfirmation(confirmationProps));
    }

    const handleFollowAction = e => {
        setIsFollowing(true);
        connectUser(e, userData._id, true);
    }

    return (
        <div id="user-card-body" onMouseLeave={closeUserCard} ref={cardRef} style={{ left: finalLeft, top: finalTop }}>
            <div className="d-flex justify-content-between">
                <img
                    alt="user"
                    onClick={moveToUserPage}
                    className="user-card-header-img"
                    src={userData?.picture ?? String(sampleUserImg)}
                    onError={e => { e.target.src = String(sampleUserImg); }}
                />

                {
                    userData?._id !== loggedUserId && (
                        <div
                            className="user-follower-action-btn"
                            title={`click to ${isFollowing ? "unfollow" : "follow"}`}
                            id={isFollowing ? "user-info-profile-editor-btn" : "user-info-follow-btn"}
                            onClick={e => { isFollowing ? handleUnfollowAction(e) : handleFollowAction(e); }}
                        >
                            <b>{isFollowing ? "Following" : "Follow"}</b>
                        </div>
                    )
                }
            </div>

            {
                (userData?.name || userData?.username) && (
                    <div>
                        {userData?.name && <b>{userData.name}</b>}
                        {userData?.username && <p>@{userData.username}</p>}
                    </div>
                )
            }

            {
                userData?.bio && (
                    <DisplayedText
                        parentType="user-card"
                        text={userData?.bio ?? ''}
                        customStyles={{ fontSize: "1rem" }}
                    />
                )
            }

            <div className="d-flex justify-content-around">
                <div
                    className="mr-2 user-follower-data"
                    onClick={e => { if (userData?.following > 0) moveToUserPage(e, "following"); }}
                >
                    <b>{userData?.following ?? 0}</b>&nbsp;Following
                </div>

                <div
                    className="ml-2 user-follower-data"
                    onClick={e => { if (userData?.followers > 0) moveToUserPage(e, "followers"); }}
                >
                    <b>{userData?.followers ?? 0}</b>&nbsp;Follower{userData.followers > 1 ? 's' : ''}
                </div>
            </div>

            <div style={{ marginTop: "5px" }}>
                <MutualConnections
                    users={mutuallyConnectedUsers}
                    handleMutualConnDisplay={e => { moveToUserPage(e, "mutualConnection"); }}
                />
            </div>
        </div>
    );
};

export default UserCard;
