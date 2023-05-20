import "src/styles/form/index.css";
import "src/styles/form/scheduled-posts.css";

import API from "src/api";
import CIcon from "@coreui/icons-react";
import * as Constants from "src/constants";
import { cilCalendarCheck } from "@coreui/icons";
import React, { useEffect, useState } from "react";
import CustomModal from "../utilities/custom-modal";
import useToaster from "src/custom-hooks/toaster-message";
import { getMonthOptions, getWeekOptions } from "src/helpers";

const ScheduledPostList = () => {
    const { showError } = useToaster();
    const monthOptions = getMonthOptions(), weekOptions = getWeekOptions();

    const [showLoader, setShowLoader] = useState(false);
    const [displayOverflow, setDisplayOverflow] = useState(false);
    const [posts, setPosts] = useState([]);
    const [selectedPosts, setSelectedPosts] = useState(0);
    const [sampleImage, setSampleImage] = useState(null);

    useEffect(() => {
        getAllScheduledPosts();
        // eslint-disable-next-line
    }, []);

    const getAllScheduledPosts = async () => {
        try {
            setShowLoader(true);
            const headerData = { Authorization: `Bearer ${localStorage.getItem("chirp-accessToken")}` };
            const response = await API(Constants.GET, Constants.GET_SCHEDULED_POSTS, null, headerData);
            const responseData = response.data;

            API(Constants.GET, Constants.GET_SAMPLE_FILE, null, headerData).then(imageResponse => {
                setSampleImage(`data:image/*;charset=utf-8;base64,${imageResponse.data}`);
            });

            let _posts = [];
            if (responseData?.meta?.status && responseData?.data?.length) {
                _posts = responseData.data.map(postObj => {
                    return { ...postObj, selected: false };
                });
            }

            setPosts(_posts);
            setShowLoader(false);
            if (_posts.length > 3) setDisplayOverflow(true);
        } catch (error) {
            setShowLoader(false);
            console.log(error);
            showError("Something went wrong!");
        }
    }

    const selectUnselectPost = postIndex => {
        const _posts = posts;

        _posts[postIndex].selected = !_posts[postIndex].selected;
        const _selectedPosts = _posts.filter(postObj => postObj.selected).length;

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
                posts.map((postObj, postIndex) => {
                    const { year, month, dayOfMonth, hours, minutes } = postObj.schedule;
                    const date = new Date(year, month, dayOfMonth, hours, minutes, 0, 0);
                    const displayedMonth = monthOptions[month].label, displayedDayOfWeek = weekOptions[date.getDay()];
                    const images = postObj?.data?.images?.map(image => `var/www/html/Projects/chirp/server/storage/post-images/${image}`) ?? [];
                    const text = postObj?.data?.text ?? '';

                    return (
                        <div
                            title="Delete"
                            key={postIndex}
                            onClick={() => selectUnselectPost(postIndex)}
                            className="scheduled-post-container mt-3 mb-3"
                            style={{ backgroundColor: postObj.selected ? "rgba(220, 53, 69, 0.4)" : "aliceblue" }}
                        >
                            <div className="scheduled-post-box w-75">
                                <div className="h-50 position-relative">
                                    <CIcon icon={cilCalendarCheck} size="sm" className="action-icon" />
                                    <span className="position-absolute" style={{ fontSize: "14px" }}>
                                        &nbsp;&nbsp;
                                        {
                                            `Will send on ${displayedDayOfWeek}, ${displayedMonth} ${dayOfMonth}, ${year} at
					                        ${hours > 9 ? hours : `0${hours}`}:${minutes > 9 ? minutes : `0${minutes}`} hours`
                                        }
                                    </span>
                                </div>

                                <div className="h-50 ml-4 row">
                                    <div className="col-md-8">
                                        {`${text?.slice(0, 28)}${text?.length > 31 ? "..." : ''}` ?? ''}
                                    </div>

                                    {
                                        !postObj.selected && (
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

                            <div className="w-25 p-2">
                                <img src={sampleImage} style={{ width: "100%", height: "100%" }} alt="uploaded" />
                            </div>
                        </div>
                    )
                })
            }
        </>
    );

    return (
        <CustomModal bodyJSX={bodyJSX} showLoader={showLoader} displayOverflow={displayOverflow} />
    );
}

export default ScheduledPostList;
