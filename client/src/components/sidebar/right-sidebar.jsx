import "src/styles/sidebar/index.css";
import "src/styles/sidebar/right-sidebar.css";

// import CIcon from "@coreui/icons-react";
// import { cilOptions } from "@coreui/icons";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import API from "src/api";
import * as Constants from "src/utilities/constants";
import useToaster from "src/custom-hooks/toaster-message";
import usePostServices from "src/custom-hooks/post-services";
import { closeConfirmation } from "src/redux/reducers/confirmation";
import useConnectionServices from "src/custom-hooks/connecting-services";
import { getCommonHeader, getUserDetails, isUserLoggedIn } from "src/utilities/helpers";

const RightSidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { showError } = useToaster();
    const commonHeader = getCommonHeader();
    const { id: loggedUserId } = isUserLoggedIn() ? getUserDetails() : {};
    const { connectUser, confirmDisconnectUser } = useConnectionServices();
    const { getFinalUserImages, closeUserCard, openUserCard } = usePostServices();

    const followStyles = { color: "var(--follow-text-color)", backgroundColor: "var(--follow-back-color)" };
    const followingStyles = {
        border: "1px solid",
        color: "var(--following-text-color)",
        backgroundColor: "var(--following-back-color)"
    };

    const maxLength = Constants.maxFrontSuggestionLength;
    const sampleUserImg = require("src/assets/sample-user.png");

    const [userImages, setUserImages] = useState({});
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [hasMaxLenghtPassed, setHasMaxLengthPassed] = useState(false);

    useEffect(() => {
        getSuggestedUsers();
        // eslint-disable-next-line
    }, []);

    const getSuggestedUsers = async () => {
        try {
            const _userImages = {};
            const { data: responseData } = await API(Constants.GET, Constants.GET_SUGGESTED_USERS, null, commonHeader);

            const _suggestedUsers = responseData?.data?.map((userObj, userIndex) => {
                const { _id: id, picture } = userObj ?? {};
                _userImages[id] = picture;
                return { ...userObj, id: id ?? userIndex, isFollowing: false };
            }) ?? [];

            const settledUserImages = await getFinalUserImages(_userImages);

            setUserImages({ ...settledUserImages });
            setHasMaxLengthPassed(_suggestedUsers.length > maxLength);
            setSuggestedUsers([..._suggestedUsers?.slice(0, maxLength)]);
        } catch (error) {
            console.log(error);
        }
    };

    const updateFollowingValue = (userId, followingValue) => {
        const _suggestedUsers = [...suggestedUsers];
        const userIndex = _suggestedUsers.findIndex(user => user.id === userId);
        if (userIndex >= 0 && _suggestedUsers[userIndex]) _suggestedUsers[userIndex]["isFollowing"] = followingValue;
        setSuggestedUsers([..._suggestedUsers]);
    }

    const handleFollowAction = userId => {
        const successCallback = () => { updateFollowingValue(userId, true); };
        if (loggedUserId) connectUser(null, userId, loggedUserId, successCallback);
        else showError("Please login to follow.");
    }

    const handleUnfollowAction = userId => {
        confirmDisconnectUser(() => {
            dispatch(closeConfirmation());
            connectUser(null, userId, false);
            updateFollowingValue(userId, false);
        });
    }

    const moveToUserPage = (e, userId) => {
        if (userId) {
            e.stopPropagation();
            navigate(`/user/${userId}`);
        } else {
            showError("user id is unavailable.");
        }
    }

    const openSuggestionPage = e => {
        e.preventDefault();
        navigate("/suggested-followers");
    }

    return (
        <div className="sidebar">
            <div id="right-sidebar-container">
                <input type="text" className="right-sidebar-searchbox special-input" placeholder="Search Chirp" />

                {/* <div id="trending-section">
                    <div className="right-sidebar-section-header">
                        <b>What's happening</b>
                    </div>

                    <div className="trending-section-margin-text font-size-17">
                        <div className="row">
                            <div className="col-md-10">Trending in India</div>
                            <div className="col-md-1"><CIcon icon={cilOptions} className="options-icon" /></div>
                        </div>

                        <div style={{ marginTop: "-8px" }}>
                            <span><b>Hello World</b></span> <br />
                            <span>87.7k posts</span>
                        </div>
                    </div>

                    <div className="trending-section-margin-text font-size-17">
                        <div className="row">
                            <div className="col-md-10">Trending in India</div>
                            <div className="col-md-1"><CIcon icon={cilOptions} className="options-icon" /></div>
                        </div>

                        <div style={{ marginTop: "-8px" }}>
                            <span><b>Hello World</b></span> <br />
                            <span>87.7k posts</span>
                        </div>
                    </div>

                    <div className="trending-section-margin-text font-size-17">
                        <div className="row">
                            <div className="col-md-10">Trending in India</div>
                            <div className="col-md-1"><CIcon icon={cilOptions} className="options-icon" /></div>
                        </div>

                        <div style={{ marginTop: "-8px" }}>
                            <span><b>Hello World</b></span> <br />
                            <span>87.7k posts</span>
                        </div>
                    </div>

                    <div className="trending-section-margin-text font-size-17">
                        <div className="row">
                            <div className="col-md-10">Trending in India</div>
                            <div className="col-md-1"><CIcon icon={cilOptions} className="options-icon" /></div>
                        </div>

                        <div style={{ marginTop: "-8px" }}>
                            <span><b>Hello World</b></span> <br />
                            <span>87.7k posts</span>
                        </div>
                    </div>

                    <div id="trending-section-show-more">
                        <span>Show More</span>
                    </div>
                </div> */}

                {
                    suggestedUsers?.length > 0 && (
                        <div id="who-to-follow-section">
                            <div className="right-sidebar-section-header"><b>Who to follow</b></div>

                            {
                                suggestedUsers.map(user => {
                                    const { name, username, id, isFollowing } = user ?? {};
                                    return name && username && (
                                        <div key={id} className="row who-to-follow-user-div">
                                            <div className="user-div-img-container">
                                                <img
                                                    alt="logo"
                                                    onMouseOut={closeUserCard}
                                                    className="sidebar-profile-img"
                                                    onClick={e => { moveToUserPage(e, id); }}
                                                    src={userImages[id] ?? String(sampleUserImg)}
                                                    onError={e => { e.target.src = String(sampleUserImg); }}
                                                    onMouseOver={e => { openUserCard(e, user, userImages[id]); }}
                                                />
                                            </div>

                                            <div className="who-to-follow-user-details">
                                                &nbsp;{name}<br />@{username}
                                            </div>

                                            <div className="w-30">
                                                <div
                                                    style={isFollowing ? followingStyles : followStyles}
                                                    className="common-custom-btn right-sidebar-follow-btn"
                                                    onClick={() => {
                                                        isFollowing ? handleUnfollowAction(id) : handleFollowAction(id);
                                                    }}
                                                >
                                                    {isFollowing ? "Following" : "Follow"}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }

                            {
                                hasMaxLenghtPassed && (
                                    <div id="who-to-follow-show-more" onClick={openSuggestionPage}>
                                        <span>Show More</span>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default RightSidebar;
