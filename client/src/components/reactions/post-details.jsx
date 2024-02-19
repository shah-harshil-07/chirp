import "src/styles/utilities/post.css";
import "src/styles/reactions/post-details.css";

import CIcon from "@coreui/icons-react";
import { Card } from "@material-ui/core";
import { useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { cilArrowLeft, cilBookmark, cilCommentBubble, cilSend, cilThumbUp } from "@coreui/icons";

import API from "src/api";
import ReplyBox from "./reply-box";
import CommentList from "./comment-list";
import * as Constants from "src/utilities/constants";
import Loader from "src/components/utilities/loader";
import DisplayedText from "../utilities/displayed-text";
import { openToaster } from "src/redux/reducers/toaster";
import useToaster from "src/custom-hooks/toaster-message";
import ImgHolder from "src/components/utilities/img-holder";
import usePostServices from "src/custom-hooks/post-services";
import { getCommonHeader, isUserLoggedIn } from "src/utilities/helpers";

const PostDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { postId } = useParams();
    const headerData = getCommonHeader();
    const likeIcon = require("src/assets/like.png");
    const savedIcon = require("src/assets/saved-filled.png");
    const sampleUserImg = require("src/assets/sample-user.png");
    const dispatch = useDispatch(), { showError } = useToaster();
    const userDetails = localStorage.getItem("chirp-userDetails");
    const loggedInUserId = userDetails ? JSON.parse(userDetails)?._id ?? '' : '';
    const {
        getPostTiming,
        createPollJSX,
        openRepostBox,
        openCommentBox,
        getFinalUserImages,
        getFormattedNumber,
        handleMutedReaction,
        getFormattedPostTiming,
        getImageFetchingPromise,
    } = usePostServices();

    const [userImages, setUserImages] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [commentList, setCommentList] = useState([]);
    const [postDetails, setPostDetails] = useState(null);
    const [isPostLiked, setIsPostLiked] = useState(false);
    const [isPostSaved, setIsPostSaved] = useState(false);
    const [initialDetailsUpdated, setInitialDetailsUpdated] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (postId) getCommentList().catch(moveBack);
        // eslint-disable-next-line
    }, [postId]);

    useEffect(() => {
        if (initialDetailsUpdated) {
            setInitialDetailsUpdated(false);
            getPostImages(postDetails.images);
            if (isUserLoggedIn()) getPostLikesAndSaves(postDetails);
        }

        // eslint-disable-next-line
    }, [postDetails, initialDetailsUpdated]);

    const getCommentList = async () => {
        setIsLoading(true);
        const data = { type: location?.state?.type ?? "post" };
        const response = await API(Constants.POST, `${Constants.COMMENT_LIST}/${postId}`, data, headerData);
        const responseData = response?.data;

        if (responseData?.meta?.status && responseData?.data) {
            const _userImages = {};
            const { post, comments } = responseData?.data ?? {};
            const _postDetails = {
                id: post?._id ?? '',
                comments: post?.comments ?? 0,
                createdAt: post?.createdAt ?? null,
                images: post?.images ?? [],
                likes: post?.likes ?? 0,
                reposts: post?.reposts ?? 0,
                saved: post?.saved ?? 0,
                text: post?.text ?? '',
                views: post?.views ?? 0,
                poll: post?.poll ?? null,
                originalPostId: post?.postId ?? null,
                parentPostDetails: {
                    id: post?.parentPost?._id ?? '',
                    text: post?.parentPost?.text ?? '',
                    poll: post?.parentPost?.poll ?? null,
                    type: post?.parentPost?.type ?? "post",
                    createdAt: post?.parentPost?.createdAt ?? null,
                    user: {
                        id: post?.parentPost?.user?._id ?? '',
                        name: post?.parentPost?.user?.name ?? '',
                        picture: post?.parentPost?.user?.picture ?? null,
                        username: post?.parentPost?.user?.username ?? '',
                    },
                },
                user: {
                    id: post?.user?._id ?? '',
                    name: post?.user?.name ?? '',
                    username: post?.user?.username ?? '',
                    picture: post?.user?.picture ?? null,
                },
            };

            if (post == null) moveBack();

            const { user: { id: mainUserId, picture: mainUserPic }, parentPostDetails } = _postDetails;
            const { user: { id: parentUserId, picture: parentUserPic } } = parentPostDetails;

            if (mainUserId && mainUserPic) _userImages[mainUserId] = mainUserPic;
            if (parentUserId && parentUserPic) _userImages[parentUserId] = parentUserPic;

            const _commentList = comments.map((commentObj, commentIndex) => {
                const { _id: userId, picture: userPic, name, username } = commentObj?.user ?? {};
                if (userPic) _userImages[userId] = userPic;

                return {
                    comments: commentObj?.comments ?? 0,
                    createdAt: commentObj?.createdAt ?? null,
                    images: commentObj?.images ?? [],
                    likes: commentObj?.likes ?? 0,
                    saved: commentObj?.saved ?? 0,
                    views: commentObj?.views ?? 0,
                    reposts: commentObj?.reposts ?? 0,
                    text: commentObj?.text ?? '',
                    id: commentObj?._id ?? commentIndex,
                    originalPostId: commentObj?.postId ?? '',
                    user: {
                        userId,
                        name: name ?? '',
                        username: username ?? '',
                        picture: userPic ?? String(sampleUserImg),
                    },
                };
            });

            const settledUserImages = await getFinalUserImages(_userImages);

            setUserImages({ ...settledUserImages });
            setCommentList([..._commentList]);
            setPostDetails({ ..._postDetails });
            setInitialDetailsUpdated(true);
        } else {
            moveBack();
        }

        setIsLoading(false);
    }

    const getPromise = (imageName, imageIndex) => {
        const successCallback = imageData => {
            const _postDetails = { ...postDetails };
            if (!_postDetails?.images) _postDetails["images"] = [];
            _postDetails.images[imageIndex] = imageData;
            setPostDetails({ ..._postDetails });
        };

        return getImageFetchingPromise(imageName, successCallback);
    }

    const getPostImages = postImageNames => {
        Promise.allSettled(postImageNames.map(getPromise));
    }

    const vote = async (e, postId, choiceIndex, pollData) => {
        e.stopPropagation();
        const { users, choices } = pollData;

        if (loggedInUserId) {
            let prevChoiceIndex;
            const userIndex = users.findIndex(user => user.userId === loggedInUserId);

            if (userIndex >= 0) {
                prevChoiceIndex = users[userIndex].choiceIndex;
                users[userIndex].choiceIndex = choiceIndex;
                choices[prevChoiceIndex].votes--;
            } else {
                users.push({ choiceIndex, userId: loggedInUserId });
            }

            const data = { postId, choiceIndex, prevChoiceIndex };

            API(Constants.POST, Constants.VOTE_POLL, data, headerData)
                .then(response => {
                    const responseData = response?.data;
                    if (responseData?.meta) {
                        const { statusCode, message } = responseData.meta;
                        const type = statusCode >= 200 && statusCode < 300 ? "Success" : "Error";
                        dispatch(openToaster({ messageObj: { type, message } }));
                    }
                });

            choices[choiceIndex].votes++;
            setPostDetails({ ...postDetails, poll: pollData });
        } else {
            showError("Please login to vote!");
        }
    }

    const getPollJSX = (pollData, postId) => {
        return createPollJSX(pollData, (e, choiceIndex) => { vote(e, postId, choiceIndex, pollData); });
    }

    const getPostLikesAndSaves = async post => {
        if (post?.id) {
            let _isPostLiked, _isPostSaved;
            const data = { postIds: [post.id] };
            const { data: reactionData } = await API(Constants.POST, Constants.GET_POST_LIKES_AND_SAVES, data, headerData);
            const reactedPostObj = reactionData?.data?.[0] ?? null;

            _isPostLiked = reactedPostObj?.liked ?? false;
            _isPostSaved = reactedPostObj?.saved ?? false;

            setIsPostLiked(_isPostLiked);
            setIsPostSaved(_isPostSaved);
        } else {
            moveBack();
        }
    }

    const triggerMutedReaction = async (e, action) => {
        e.stopPropagation();

        const postData = { postId: postDetails.id, isLiked: isPostLiked, isSaved: isPostSaved };
        let _isPostLiked = isPostLiked, _isPostSaved = isPostSaved, postObj = { ...postDetails };

        const handleLikeAction = mode => {
            _isPostLiked = mode === "add";
            postObj["likes"] += mode === "add" ? 1 : -1;

            setIsPostLiked(_isPostLiked);
            setPostDetails({ ...postObj });
        }

        const handleSaveAction = mode => {
            _isPostSaved = mode === "add";
            postObj["saved"] += mode === "add" ? 1 : -1;

            setIsPostSaved(_isPostSaved);
            setPostDetails({ ...postObj });
        }

        handleMutedReaction(action, postData, handleLikeAction, handleSaveAction);
    }

    const triggerVocalReaction = (e, reactionType) => {
        let reactionFn = null;
        if (reactionType === "repost") reactionFn = openRepostBox;
        else if (reactionType === "comment") reactionFn = openCommentBox;
        const data = { ...postDetails, type: location?.state?.type ?? "post" };
        const clonedData = JSON.parse(JSON.stringify(data));
        if (clonedData?.user?.picture) clonedData.user.picture = userImages?.[postDetails?.user?.id ?? '0'] ?? '';
        if (reactionFn) reactionFn(e, clonedData); else showError("Something went wrong!");
    }

    const moveBack = () => {
        navigate(-1);
    }

    const moveToUserPage = (e, userId) => {
        if (userId) {
            e.stopPropagation();
            navigate(`/user/${userId}`);
        } else {
            showError("user id is unavailable.");
        }
    }

    const moveToPostDetailPage = (e, postId, type = "post") => {
        if (postId) {
            e.stopPropagation();
            navigate(`/post/${postId}`, { state: { type } });
        } else {
            showError("post id is unavailable.");
        }
    }

    return (
        <div>
            <div className="common-header">
                <div className="common-heading-icon" onClick={moveBack}>
                    <CIcon width={20} height={20} size="sm" icon={cilArrowLeft} />
                </div>

                <div className="common-heading-text">Comments</div>
            </div>

            <Card className="post-detail-card">
                {
                    isLoading ? <Loader /> : (
                        <>
                            <div className="post-detail-card-header" onClick={e => { moveToUserPage(e, postDetails?.user?.id); }}>
                                <img
                                    alt="user"
                                    className="post-detail-card-header-image"
                                    onError={e => { e.target.src = String(sampleUserImg); }}
                                    src={userImages?.[postDetails?.user?.id ?? '0'] ?? String(sampleUserImg)}
                                />

                                <div className="post-detail-card-header-text">
                                    <div><b>{postDetails?.user?.name ?? ''}</b></div>
                                    {postDetails?.user?.username && <div>{`@${postDetails?.user?.username ?? ''}`}</div>}
                                </div>
                            </div>

                            <div className="post-detail-body">
                                <div className="row mx-0 font-size-20">
                                    <div>
                                        <DisplayedText parentType="post-detail-body" text={postDetails?.text ?? ''} />
                                    </div>
                                </div>

                                {postDetails?.poll?.choices && getPollJSX(postDetails.poll, postDetails.id)}
                                {
                                    postDetails?.images?.length > 0 && (
                                        <ImgHolder images={postDetails?.images} showActionButtons={false} />
                                    )
                                }

                                {
                                    postDetails?.parentPostDetails?.user?.name && (
                                        <div
                                            className="post-list-repost-body repost-body"
                                            style={{ marginTop: postDetails?.images?.length ? "10px" : '0' }}
                                        >
                                            <img
                                                alt="post creator"
                                                className="post-detail-parent-user-img"
                                                onError={e => { e.target.src = String(sampleUserImg); }}
                                                onClick={e => { moveToUserPage(e, postDetails?.parentPostDetails?.user?.id); }}
                                                src={
                                                    userImages?.[postDetails?.parentPostDetails?.user?.id ?? '0'] ??
                                                    String(sampleUserImg)
                                                }
                                            />

                                            <div
                                                className="post-detail-repost-body-content"
                                                onClick={e => {
                                                    moveToPostDetailPage(
                                                        e,
                                                        postDetails?.parentPostDetails?.id ?? '',
                                                        postDetails?.parentPostDetails?.type ?? "post"
                                                    );
                                                }}
                                            >
                                                <div className="row mx-0 font-size-19 post-detail-repost-body-title">
                                                    <b>{postDetails?.parentPostDetails?.user?.name ?? ''}</b>&nbsp;

                                                    <span>{`@${postDetails?.parentPostDetails?.user?.username ?? ''}`}</span>

                                                    <span>
                                                        <div className="seperator-container">
                                                            <div className="seperator" />
                                                        </div>
                                                    </span>

                                                    <span>{getPostTiming(postDetails?.parentPostDetails?.createdAt)}</span>
                                                </div>

                                                <div className="row mx-0 mt-1 font-size-20">
                                                    <div>
                                                        <DisplayedText
                                                            parentType="post-detail-repost"
                                                            text={postDetails?.parentPostDetails?.text ?? ''}
                                                            uniqueId={postDetails?.parentPostDetails?.id ?? ''}
                                                            readMoreAction={e => {
                                                                moveToPostDetailPage(
                                                                    e,
                                                                    postDetails?.parentPostDetails?.id ?? '',
                                                                    postDetails?.parentPostDetails?.type ?? "post"
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                <div>
                                    {getFormattedPostTiming(postDetails?.createdAt ?? null)}&nbsp;&nbsp;
                                    {
                                        postDetails?.views >= 0 && (
                                            <span>
                                                <b>
                                                    {`${getFormattedNumber(postDetails.views)} View${postDetails.views > 1 ? 's' : ''}`}
                                                </b>
                                            </span>
                                        )
                                    }
                                </div>

                                <div className="action-bar">
                                    <div
                                        className="reaction-icon-container reply-container"
                                        onClick={e => { triggerVocalReaction(e, "comment"); }}
                                    >
                                        <span className="reply-icon">
                                            <CIcon title="Reply" icon={cilCommentBubble} className="chirp-action" />
                                        </span>

                                        <span className="post-reaction-data">
                                            {getFormattedNumber(postDetails?.comments ?? 0)}
                                        </span>
                                    </div>

                                    <div
                                        className="reaction-icon-container repost-container"
                                        onClick={e => { triggerVocalReaction(e, "repost"); }}
                                    >
                                        <span className="reply-icon">
                                            <CIcon icon={cilSend} title="Repost" className="chirp-action" />
                                        </span>

                                        <span className="post-reaction-data">
                                            {getFormattedNumber(postDetails?.reposts ?? 0)}
                                        </span>
                                    </div>

                                    <div
                                        className="reaction-icon-container like-container"
                                        onClick={e => { triggerMutedReaction(e, "like"); }}
                                    >
                                        <span className="reply-icon" style={isPostLiked ? { paddingTop: "6px" } : {}}>
                                            {
                                                isPostLiked ? (
                                                    <img width="20" height="20" src={String(likeIcon)} alt="like" />
                                                ) : (
                                                    <CIcon title="Like" icon={cilThumbUp} className="chirp-action" />
                                                )
                                            }
                                        </span>

                                        <span
                                            className="post-reaction-data"
                                            style={isPostLiked ? { color: "var(--liked-color)" } : {}}
                                        >
                                            {getFormattedNumber(postDetails?.likes ?? 0)}
                                        </span>
                                    </div>

                                    {
                                        location?.state?.type !== "comment" && (
                                            <div
                                                className="reaction-icon-container saved-container"
                                                onClick={e => { triggerMutedReaction(e, "save"); }}
                                            >
                                                <span className="reply-icon" style={false ? { paddingTop: "6px" } : {}}>
                                                    {
                                                        isPostSaved ? (
                                                            <img width="20" height="20" src={String(savedIcon)} alt="like" />
                                                        ) : (
                                                            <CIcon title="Bookmark" icon={cilBookmark} className="chirp-action" />
                                                        )
                                                    }
                                                </span>

                                                <span
                                                    className="post-reaction-data"
                                                    style={isPostSaved ? { color: "var(--saved-color)" } : {}}
                                                >
                                                    {getFormattedNumber(postDetails?.saved ?? 0)}
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </>
                    )
                }
            </Card>

            {
                isUserLoggedIn() ? (
                    <ReplyBox
                        id={postId ?? ''}
                        type={location?.state?.type ?? "post"}
                        username={postDetails?.user?.username ?? ''}
                        originalPostId={postDetails?.originalPostId ?? ''}
                        picture={userImages?.[postDetails?.user?.id ?? '0']}
                    />
                ) : (
                    <div id="post-detail-seperator"><div className="seperator" /></div>
                )
            }

            <CommentList isLoading={isLoading} userImages={userImages} commentList={commentList} />
        </div>
    );
}

export default PostDetails;
