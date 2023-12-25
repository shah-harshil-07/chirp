import "src/styles/post.css";
import "src/styles/user/posts.css";

import React from "react";

import PostUtilities from "../utilities/posts";

const UserPosts = () => {
    return (
        <>
            <div id="user-post-tab-view">Posts</div>
            <PostUtilities parentName={"user"} />
        </>
    );
};

export default UserPosts;
