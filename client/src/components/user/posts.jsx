import "src/styles/post.css";
import "src/styles/user/posts.css";

import React, { useState } from "react";

import PostUtilities from "../utilities/posts";

const UserPosts = () => {
    const tabs = [{ label: "Posts", parentName: "user" }, { label: "Saved", parentName: "saved" }];

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
                        const { label } = tab;
                        const isNonCurrentTab = tabIndex !== currentTabIndex;
                        return (
                            <div
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
