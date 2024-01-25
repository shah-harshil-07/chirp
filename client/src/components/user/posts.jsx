import "src/styles/user/posts.css";
import "src/styles/utilities/post.css";

import React, { useState } from "react";
import { useLocation } from "react-router-dom";

import PostUtilities from "../utilities/posts";
import { getUserDetails, isUserLoggedIn, userTabs } from "src/utilities/helpers";

const UserPosts = ({ userId }) => {
    let defaultIndex = 0;
    const location = useLocation();
    const loggedInUserData = isUserLoggedIn() ? getUserDetails() : null;
    const { id: loggedUserId } = loggedInUserData ?? {}, tabs = [ ...userTabs ];

    if (userId !== loggedUserId) tabs.pop();
    else if (location?.state?.viewSaved) defaultIndex = 2;

    const [currentTabIndex, setCurrentTabIndex] = useState(defaultIndex);

    const changeTab = (e, tabIndex) => {
        e.preventDefault();
        setCurrentTabIndex(tabIndex);
    }

    return (
        <>
            <div className="d-flex">
                {
                    tabs.map((tab, tabIndex) => {
                        const { label } = tab, isNonCurrentTab = tabIndex !== currentTabIndex;

                        return (
                            <div
                                key={tabIndex}
                                onClick={e => { changeTab(e, tabIndex); }}
                                className={`user-post-tab-view ${isNonCurrentTab ? "non-curr-tab-view" : ''}`}
                            >
                                {
                                    isNonCurrentTab ? (
                                        <>{label}</>
                                    ) : (
                                        <>
                                            <div className="current-tab-label">{label}</div>
                                            <div className="current-tab-highlight" />
                                        </>
                                    )
                                }
                            </div>
                        );
                    })
                }
            </div>

            <PostUtilities parentName={tabs?.[currentTabIndex]?.parentName ?? "user"} />
        </>
    );
};

export default UserPosts;
