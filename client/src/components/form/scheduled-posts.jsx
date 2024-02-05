import "src/styles/form/index.css";
import "src/styles/form/scheduled-posts.css";

import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { cilCalendarCheck, cilList } from "@coreui/icons";

import API from "src/api";
import ImgHolder from "../utilities/img-holder";
import CustomModal from "../utilities/custom-modal";
import * as Constants from "src/utilities/constants";
import { getCommonHeader } from "src/utilities/helpers";
import useToaster from "src/custom-hooks/toaster-message";
import DateOptionServices from "src/custom-hooks/date-services";
import useImageConverter from "src/custom-hooks/image-converter";
import { closeModal, openModalWithProps } from "src/redux/reducers/modal";
import { closeConfirmation, openConfirmation } from "src/redux/reducers/confirmation";

const ScheduledPostList = () => {
    const dispatch = useDispatch();
    const dateService = new DateOptionServices();
    const { showError, showSuccess } = useToaster();
    const weekOptions = dateService.getWeekOptions();
    const monthOptions = dateService.getMonthOptions();
    const { getFileObjectFromBase64 } = useImageConverter(), headerData = getCommonHeader();
    const placeHolderImgUrl = "https://abs.twimg.com/responsive-web/client-web/alarm-clock-400x200.v1.da96e5d9.png";

    const [posts, setPosts] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [selectedPosts, setSelectedPosts] = useState(0);
    const [displayOverflow, setDisplayOverflow] = useState(false);
    const [scheduledPostImages, setSchduledPostImages] = useState([]);
    const [scheduledPostFileObjects, setScheduledPostFileObjects] = useState([]);

    useEffect(() => {
        getAllScheduledPosts();
        // eslint-disable-next-line
    }, []);

    const getBasePromise = image => {
        return API(Constants.GET, `${Constants.GET_POST_IMAGE}/${image}`, null, headerData);
    }

    const getScheduledPostImages = posts => {
        const promises = [];

        posts.forEach((post, postIndex) => {
            post.forEach((image, imageIndex) => {
                const _scheduledPostImages = scheduledPostImages;
                if (!_scheduledPostImages[postIndex]) _scheduledPostImages[postIndex] = [];

                promises.push(new Promise((res, rej) => {
                    getBasePromise(image)
                        .then(imageResponse => {
                            if (imageResponse?.data) {
                                const base64ImgData = imageResponse.data;
                                _scheduledPostImages[postIndex][imageIndex] = Constants.base64Prefix + base64ImgData;
                                updateScheduledPostFileObjects(base64ImgData, postIndex, imageIndex, image);
                                setSchduledPostImages([..._scheduledPostImages]);
                                res();
                            } else {
                                rej();
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            rej();
                        });
                }));
            });
        });

        Promise.allSettled(promises);
    }

    const updateScheduledPostFileObjects = (base64ImgData, postIndex, imageIndex, fileName) => {
        const fileObj = getFileObjectFromBase64(base64ImgData, fileName);
        let _scheduledPostFileObjects = scheduledPostFileObjects;
        if (!_scheduledPostFileObjects?.[postIndex]) _scheduledPostFileObjects[postIndex] = [];
        _scheduledPostFileObjects[postIndex][imageIndex] = fileObj;
        setScheduledPostFileObjects([..._scheduledPostFileObjects]);
    }

    const getAllScheduledPosts = async () => {
        try {
            setShowLoader(true);
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
                if (_posts.length > 2) setDisplayOverflow(true);
            }
        } catch (error) {
            console.log(error);
            setShowLoader(false);
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
        e.preventDefault(); e.stopPropagation();
        const { data, schedule, _id } = posts[postIndex], formattedImages = [];

        for (let i = 0; i < data?.images?.length; i++) {
            if (scheduledPostImages?.[postIndex]?.[i] && scheduledPostFileObjects?.[postIndex]?.[i]) {
                const imageData = {
                    image: scheduledPostImages[postIndex][i],
                    file: scheduledPostFileObjects[postIndex][i],
                };

                formattedImages.push(imageData);
            }
        }

        data.images = formattedImages;

        dispatch(openModalWithProps({ type: "scheduledPostEditor", props: { data, schedule, id: _id } }));
    }

    const deleteScheduledPosts = async () => {
        dispatch(closeConfirmation());

        try {
            const selectedPosts = posts.filter(post => post.selected);
            const selectedPostIds = selectedPosts.map(post => post._id);
            const data = { postIds: selectedPostIds };
            const response = await API(Constants.DELETE, Constants.DELETE_SCHEDULED_POST_IMAGES, data, headerData);
            const responseData = response.data;
            if (responseData?.meta?.message) {
                showSuccess(responseData.meta.message);
                dispatch(closeModal());
            }
        } catch (error) {
            console.log(error);
            showError("Something went wrong!");
        }
    }

    const openDeleteConfirmation = () => {
        const confirmationProps = {
            headingText: "Delete post",
            handleConfirmAction: deleteScheduledPosts,
            message: `Are you sure you want to delete the scheduled ${selectedPosts > 1 ? "posts" : "post"}?`,
        };

        dispatch(openConfirmation(confirmationProps));
    }

    const bodyJSX = (
        <>
            <div className="row">
                <div className="col-md-8"><h3><b>Scheduled Posts</b></h3></div>

                {
                    posts.length > 0 && (
                        <div className="col-md-4">
                            <button
                                onClick={openDeleteConfirmation}
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
                    const text = postObj?.data?.text ?? '', images = scheduledPostImages[postIndex], poll = postObj?.data?.poll;

                    return (
                        <div
                            title="Delete"
                            key={postIndex}
                            className="scheduled-post-container mt-3 mb-3"
                            onClick={() => { selectUnselectPost(postIndex); }}
                            style={{ backgroundColor: postObj.selected ? "rgba(220, 53, 69, 0.4)" : "aliceblue" }}
                        >
                            <div className="scheduled-post-box w-75">
                                <div className="h-50 position-relative">
                                    <CIcon icon={cilCalendarCheck} size="sm" className="action-icon" />
                                    <span className="position-absolute font-size-14">
                                        &nbsp;&nbsp;
                                        {
                                            `Will send on ${displayedDayOfWeek}, ${displayedMonth.slice(0, 3)} ${dayOfMonth},
                                            ${year} at ${hours > 9 ? hours : `0${hours}`}:${minutes > 9 ? minutes : `0${minutes}`} hours`
                                        }
                                    </span>
                                </div>

                                <div className="h-50 ml-4">
                                    {`${text?.slice(0, 28)}${text?.length > 31 ? "..." : ''}` ?? ''}
                                </div>

                                {
                                    !postObj.selected && (
                                        <div className="ml-4">
                                            <button
                                                className="scheduled-post-edit-btn"
                                                onClick={e => { editScheduledPost(e, postIndex); }}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )
                                }
                            </div>

                            <div className="w-25 mh-100 p-2">
                                {
                                    images?.length > 0 ? (
                                        <ImgHolder images={scheduledPostImages[postIndex]} showActionButtons={false} />
                                    ) : poll ? (
                                        <CIcon
                                            size="sm"
                                            icon={cilList}
                                            className="mw-100 mh-100"
                                            style={{ color: "gainsboro" }}
                                        />
                                    ) : (
                                        <></>
                                    )
                                }
                            </div>
                        </div>
                    );
                }) : (
                    <div>
                        <img src={placeHolderImgUrl} alt="placeholder" className="w-100 h-70" />

                        <div id="scheduled-post-placeholder-text">
                            Not ready to send a post just yet? Save it to your drafts or schedule it for later.
                        </div>
                    </div>
                )
            }
        </>
    );

    return <CustomModal bodyJSX={bodyJSX} includeHeader={true} showLoader={showLoader} displayOverflow={displayOverflow} />;
}

export default ScheduledPostList;
