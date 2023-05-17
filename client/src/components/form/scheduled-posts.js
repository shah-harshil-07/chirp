import "src/styles/form/index.css";
import "src/styles/form/scheduled-posts.css";

import React, { useState } from "react";
import CustomModal from "../utilities/custom-modal";
import CIcon from "@coreui/icons-react";
import { cilCalendarCheck } from "@coreui/icons";

const ScheduledPostList = () => {
    const _posts = Array(4).fill(0);
    const [showLoader, setShowLoader] = useState(false);
    const [footerText, setFooterText] = useState('');
    const [includeFooter, setIncludeFooter] = useState(false);
    const [displayOverflow, setDisplayOverflow] = useState(true);
    const [posts, setPosts] = useState(_posts);
    const [selectedPosts, setSelectedPosts] = useState(0);

    const selectUnselectPost = postIndex => {
        const _posts = posts;

        _posts[postIndex] = _posts[postIndex] === 1 ? 0 : 1;
        const _selectedPosts = _posts.filter(postObj => postObj === 1).length;

        setPosts([..._posts]);
        setSelectedPosts(_selectedPosts);
    }

    const editScheduledPost = (e, postIndex) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(postIndex);
    }

    const bodyJSX = (
        <>
            <div className="row">
                <div className="col-md-8">
                    <h3><b>Scheduled Posts</b></h3>
                </div>

                <div className="col-md-4">
                    <button
                        className="btn btn-danger scheduled-post-delete-btn"
                        style={{ opacity: selectedPosts > 0 ? '1' : "0.4" }}
                    >
                        {`Delete post${selectedPosts > 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>

            {
                posts.map((postObj, postIndex) => (
                    <div
                        title="Delete"
                        onClick={() => selectUnselectPost(postIndex)}
                        className="scheduled-post-container mt-3 mb-3"
                        style={{ backgroundColor: postObj ? "#DC3545" : "aliceblue" }}
                    >
                        <div className="scheduled-post-box w-75">
                            <div className="h-50 position-relative">
                                <CIcon icon={cilCalendarCheck} size="sm" className="action-icon" />
                                <span className="position-absolute" style={{ fontSize: "14px" }}>
                                    &nbsp;&nbsp;Will send on Wed May 17, 2023 at 11:27 hours
                                </span>
                            </div>

                            <div className="h-50 ml-4 row">
                                <div className="col-md-8">Hello World</div>
                                {
                                    (postObj === 0) && (
                                        <div className="col-md-4">
                                            <button
                                                className="scheduled-post-edit-btn"
                                                onClick={e => editScheduledPost(e, postIndex)}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        </div>

                        <div className="w-25 p-2">Images</div>
                    </div>
                ))
            }
        </>
    );

    return (
        <CustomModal
            bodyJSX={bodyJSX}
            showLoader={showLoader}
            footerText={footerText}
            includeFooter={includeFooter}
            displayOverflow={displayOverflow}
        />
    )
}

export default ScheduledPostList;
