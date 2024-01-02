import "src/styles/user/posts.css";
import "src/styles/utilities/post.css";

import React, { useState } from "react";

import PostUtilities from "../utilities/posts";
import { getUserDetails, isUserLoggedIn, userTabs } from "src/utilities/helpers";

const UserPosts = ({ userId }) => {
    const loggedInUserData = isUserLoggedIn() ? getUserDetails() : null;
    const { id: loggedUserId } = loggedInUserData ?? {}, tabs = [ ...userTabs ];

    if (userId !== loggedUserId) tabs.pop();

    const [currentTabIndex, setCurrentTabIndex] = useState(0);

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

            <PostUtilities parentName={tabs[currentTabIndex]["parentName"]} />
        </>
    );
};

export default UserPosts;
