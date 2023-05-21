import "src/styles/form/index.css";
import "src/styles/form/scheduled-posts.css";

import React, { useEffect, useState } from "react";
import { cilCalendarCheck } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";

import API from "src/api";
import ImgHolder from "./img-holder";
import * as Constants from "src/constants";
import CustomModal from "../utilities/custom-modal";
import useToaster from "src/custom-hooks/toaster-message";
import { getMonthOptions, getWeekOptions } from "src/helpers";
import { openModalWithProps } from "src/redux/actions/modal";

const ScheduledPostList = () => {
    const { showError } = useToaster();
    const dispatch = useDispatch();
    const monthOptions = getMonthOptions(), weekOptions = getWeekOptions();
    const placeHolderImgUrl = "https://abs.twimg.com/responsive-web/client-web/alarm-clock-400x200.v1.da96e5d9.png";

    const [posts, setPosts] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [selectedPosts, setSelectedPosts] = useState(0);
    const [displayOverflow, setDisplayOverflow] = useState(false);
    const [scheduledPostImages, setSchduledPostImages] = useState([]);

    useEffect(() => {
        getAllScheduledPosts();
        // eslint-disable-next-line
    }, []);

    const getBasePromise = image => {
        const headerData = { Authorization: `Bearer ${localStorage.getItem("chirp-accessToken")}` };
        return API(Constants.GET, `${Constants.GET_SCHEDULED_POST_IMAGE}/${image}`, null, headerData);
    }

    const getScheduledPostImages = posts => {
        const promises = [];

        posts.forEach((post, postIndex) => {
            post.forEach((image, imageIndex) => {
                const _scheduledPostImages = scheduledPostImages;
                if (!_scheduledPostImages[postIndex]) _scheduledPostImages[postIndex] = [];

                promises.push(new Promise((res, rej) => {
                    getBasePromise(image).then(imageResponse => {
                        if (imageResponse?.data) {
                            _scheduledPostImages[postIndex][imageIndex] = `data:image/*;charset=utf-8;base64,${imageResponse.data}`
                            setSchduledPostImages([..._scheduledPostImages]);
                            res();
                        } else {
                            rej();
                        }
                    });
                }));
            });
        });

        Promise.allSettled(promises);
    }

    const getAllScheduledPosts = async () => {
        try {
            setShowLoader(true);
            const headerData = { Authorization: `Bearer ${localStorage.getItem("chirp-accessToken")}` };
            const response = await API(Constants.GET, Constants.GET_SCHEDULED_POSTS, null, headerData);
            setShowLoader(false);

            if (response?.data?.meta?.status && response?.data?.data?.length) {
                const posts = response.data.data, images = [];

                for (let i = 0; i < posts.length; i++) {
                    const postImages = posts[i]?.data?.images ?? [];
                    images.push(postImages);
                }

                if (images?.length) getScheduledPostImages(images);

                let _posts = posts.map(postObj => {
                    return { ...postObj, selected: false };
                });

                setPosts(_posts);
                if (_posts.length > 3) setDisplayOverflow(true);
            }
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

        const { data } = posts[postIndex];

        for (let i = 0; i < data?.images?.length; i++) {
            data["images"][i] = scheduledPostImages[postIndex][i];
        }

		dispatch(openModalWithProps("scheduledPostEditor", data));
    }

    const bodyJSX = (
        <>
            <div className="row">
                <div className="col-md-8"><h3><b>Scheduled Posts</b></h3></div>

                {
                    posts.length > 0 && (
                        <div className="col-md-4">
                            <button
                                className="btn btn-danger scheduled-post-delete-btn"
                                style={{ opacity: selectedPosts > 0 ? '1' : "0.4" }}
                            >
                                {`Delete ${selectedPosts > 0 ? selectedPosts : ''} post${selectedPosts > 1 ? 's' : ''}`}
                            </button>
                        </div>
                    )
                }
            </div>

            {
                posts.length > 0 ? posts.map((postObj, postIndex) => {
                    const { year, month, dayOfMonth, hours, minutes } = postObj.schedule;
                    const date = new Date(year, month, dayOfMonth, hours, minutes, 0, 0);
                    const displayedMonth = monthOptions[month].label, displayedDayOfWeek = weekOptions[date.getDay()];
                    const text = postObj?.data?.text ?? '', images = scheduledPostImages[postIndex];

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

                                <div className="h-50 ml-4">
                                    {`${text?.slice(0, 28)}${text?.length > 31 ? "..." : ''}` ?? ''}
                                </div>

                                {
                                    !postObj.selected && (
                                        <div className="ml-4">
                                            <button className="scheduled-post-edit-btn" onClick={e => editScheduledPost(e, postIndex)}>
                                                Edit
                                            </button>
                                        </div>
                                    )
                                }
                            </div>

                            <div className="w-25 mh-100 p-2">
                                {images?.length > 0 && (<ImgHolder images={scheduledPostImages[postIndex]} showActionButtons={false} />)}
                            </div>
                        </div>
                    )
                }) : (
                    <div>
                        <img src={placeHolderImgUrl} alt="placeholder" className="w-100 h-70" />

                        <div id="scheduled-post-placeholder-text">
                            Not ready to send a Tweet just yet? Save it to your drafts or schedule it for later.
                        </div>
                    </div>
                )
            }
        </>
    );

    return (
        <CustomModal bodyJSX={bodyJSX} showLoader={showLoader} displayOverflow={displayOverflow} />
    );
}

export default ScheduledPostList;
