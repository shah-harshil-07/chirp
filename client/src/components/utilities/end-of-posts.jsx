import "src/styles/utilities/end-of-posts.css";

import React from "react";

import Loader from "./loader";

const EndOfPosts = ({ isLoading, morePostsAvailable }) => {
    const reloadAction = () => {
        window.scrollTo(0, 0);
        window.location.reload();
    }

    return isLoading ? <Loader /> : morePostsAvailable ? (
        <div id="more-posts-box">
            <div className="seperator-container"><div className="seperator" /></div>
        </div>
    ) : (
        <>
            <center><i>No more posts are available. Refresh the page to see new posts.</i></center>
            <div id="no-posts-reload-container">
                <div onClick={reloadAction} className="chirp-button">Reload</div>
            </div>
        </>
    );
};

export default EndOfPosts;
