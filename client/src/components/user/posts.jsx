import "src/styles/post.css";
import "src/styles/user/posts.css";

import React from "react";

import PostUtilities from "../utilities/posts";

const UserPosts = () => {
    return (
        <>
            <span className="d-flex">
                <div className="user-post-tab-view">
                    <div style={{ alignSelf: "center", marginTop: "15px" }}>Posts</div>
                    <div style={{ width: "100%", backgroundColor: "var(--chirp-color)", height: "2px" }}></div>
                </div>

                <div style={{ justifyContent: "center", alignItems: "center" }} className="user-post-tab-view">Saved</div>
            </span>

            <PostUtilities parentName={"user"} />
        </>
    );
};

export default UserPosts;
