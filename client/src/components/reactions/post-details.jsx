import "src/styles/post.css";

import CIcon from "@coreui/icons-react";
import { Card } from "@material-ui/core";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { cilBookmark, cilChart, cilCommentBubble, cilSend, cilThumbUp } from "@coreui/icons";

import API from "src/api";
import ReplyBox from "./reply-box";
import * as Constants from "src/utilities/constants";
import { openToaster } from "src/redux/reducers/toaster";
import useToaster from "src/custom-hooks/toaster-message";
import ImgHolder from "src/components/utilities/img-holder";
import usePostServices from "src/custom-hooks/post-services";
import { openModalWithProps } from "src/redux/reducers/modal";
import { getCommonHeader, isUserLoggedIn } from "src/utilities/helpers";
import CommentList from "./comment-list";

const PostDetails = () => {
    const headerData = getCommonHeader();
    const availableMutedActions = ["like", "save"];
    const likeIcon = require("src/assets/like.png");
    const savedIcon = require("src/assets/saved-filled.png");
    const dispatch = useDispatch(), { showError } = useToaster();
    const userDetails = localStorage.getItem("chirp-userDetails");
    const { postId } = useParams(), { getPostTiming } = usePostServices();
    const loggedInUserId = userDetails ? JSON.parse(userDetails)?._id ?? '' : '';

    const [commentList, setCommentList] = useState([]);
    const [postDetails, setPostDetails] = useState(null);
    const [isPostLiked, setIsPostLiked] = useState(false);
    const [isPostSaved, setIsPostSaved] = useState(false);
    const [initialDetailsUpdated, setInitialDetailsUpdated] = useState(false);

    useEffect(() => {
        if (postId) getCommentList();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (initialDetailsUpdated) {
            setInitialDetailsUpdated(false);
            getPostLikesAndSaves(postDetails);
            getPostImages(postDetails.images);
        }

        // eslint-disable-next-line
    }, [postDetails, initialDetailsUpdated]);

    const getCommentList = async () => {
        const response = await API(Constants.GET, `${Constants.COMMENT_LIST}/${postId}`, null, headerData);
        const responseData = response?.data;

        if (responseData?.meta?.status && responseData?.data) {
            const { post, comments } = responseData.data;
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
                parentPostDetails: {
                    id: post?.parentPost?._id ?? '',
                    text: post?.parentPost?.text ?? '',
                    poll: post?.parentPost?.poll ?? null,
                    images: post?.parentPost?.images ?? [],
                    createdAt: post?.parentPost?.createdAt ?? null,
                    user: {
                        name: post?.parentPost?.user?.name ?? '',
                        picture: post?.parentPost?.user?.picture ?? null,
                        username: post?.parentPost?.user?.username ?? '',
                    },
                },
                user: {
                    name: post?.user?.name ?? '',
                    username: post?.user?.username ?? '',
                    picture: post?.user?.picture ?? null,
                },
            };

            const _commentList = comments.map((commentObj, commentIndex) => {
                return {
                    comments: commentObj?.comments ?? 0,
                    createdAt: commentObj?.createdAt ?? null,
                    images: commentObj?.images ?? [],
                    likes: commentObj?.likes ?? 0,
                    saved: commentObj?.saved ?? 0,
                    text: commentObj?.text ?? '',
                    id: commentObj?._id ?? commentIndex,
                    user: {
                        name: commentObj?.user?.name ?? '',
                        username: commentObj?.user?.username ?? '',
                        picture: commentObj?.user?.picture ?? Constants.placeHolderImageSrc,
                    },
                };
            });

            setCommentList([..._commentList]);
            setPostDetails({ ..._postDetails });
            setInitialDetailsUpdated(true);
        }
    }

    const getPromise = (imageName, imageIndex) => {
        return new Promise((res, rej) => {
            API(Constants.GET, `${Constants.GET_POST_IMAGE}/${imageName}`, null, headerData)
                .then(imageResponse => {
                    const base64ImgData = imageResponse.data;
                    const base64Prefix = "data:image/*;charset=utf-8;base64,";
                    const imageData = base64Prefix + base64ImgData;

                    const _postDetails = { ...postDetails };
                    if (!_postDetails?.images) _postDetails["images"] = [];
                    _postDetails.images[imageIndex] = imageData;
                    setPostDetails({ ..._postDetails });
                    res();
                })
                .catch(err => {
                    console.log(err);
                    rej();
                });
        });
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

    const getGradient = (votePercent, isVoted = false) => {
        const bgColor = isVoted ? "#1DA1F2" : "#e9ecef";
        return `linear-gradient(to right, ${bgColor} ${votePercent}%, white ${votePercent}% 100%)`;
    }

    const getPollJSX = (pollData, postId) => {
        const { choices, users } = pollData;
        let votedIndex = -1, userIndex = -1;
        const totalVotes = choices.reduce((votesAcc, { votes }) => votesAcc += votes, 0);

        if (loggedInUserId) {
            userIndex = users.findIndex(user => user.userId === loggedInUserId);
            if (userIndex >= 0) votedIndex = users[userIndex]?.choiceIndex ?? -1;
        }

        return (
            <div className="mt-3 mb-3">
                {
                    choices.map((choiceObj, choiceIndex) => {
                        const { label, votes } = choiceObj;
                        const votePercent = Math.ceil(votes / totalVotes * 100);
                        const isVoted = (choiceIndex === votedIndex && users[userIndex].userId === loggedInUserId);

                        return (
                            <div
                                key={choiceIndex}
                                className="post-poll-bar"
                                style={{ background: getGradient(votePercent, isVoted) }}
                                onClick={e => { if (!isVoted) vote(e, postId, choiceIndex, pollData); }}
                            >
                                {label ?? ''}

                                {
                                    votedIndex >= 0 && (
                                        <div className="post-vote-percent-label">{`${votePercent.toFixed(0)}%`}</div>
                                    )
                                }
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    const openCommentBox = e => {
        e.stopPropagation();
        if (isUserLoggedIn()) dispatch(openModalWithProps({ type: "commentEditor", props: postDetails }));
        else showError("Please login to comment!");
    }

    const openRepostBox = e => {
        e.stopPropagation();
        if (isUserLoggedIn()) dispatch(openModalWithProps({ type: "repostEditor", props: postDetails }));
        else showError("Please login to repost!");
    }

    const getPostLikesAndSaves = async post => {
        let _isPostLiked, _isPostSaved;
        const data = { postIds: [post.id] };
        const { data: reactionData } = await API(Constants.POST, Constants.GET_POST_LIKES_AND_SAVES, data, headerData);
        const reactedPostObj = reactionData?.data?.[0] ?? null;

        _isPostLiked = reactedPostObj?.liked ?? false;
        _isPostSaved = reactedPostObj?.saved ?? false;

        setIsPostLiked(_isPostLiked);
        setIsPostSaved(_isPostSaved);
    }

    const triggerMutedReaction = async (e, action) => {
        e.stopPropagation();
        if (availableMutedActions.includes(action)) {
            if (isUserLoggedIn()) {
                const postObj = { ...postDetails };
                const { id: postId } = postObj;
                let _isPostLiked = isPostLiked, _isPostSaved = isPostSaved;
                const data = { postId, postType: "post", reaction: '' }; let mode, url;

                switch (action) {
                    case "like":
                        data["reaction"] = "liked";
                        mode = isPostLiked ? "remove" : "add";
                        _isPostLiked = mode === "add";
                        postObj["likes"] += mode === "add" ? 1 : -1;
                        url = isPostLiked ? Constants.REMOVE_SAVES_LIKES : Constants.ADD_SAVES_LIKES;
                        break;
                    case "save":
                        data["reaction"] = "saved";
                        mode = isPostSaved ? "remove" : "add";
                        _isPostSaved = mode === "add";
                        postObj["saved"] += mode === "add" ? 1 : -1;
                        url = isPostSaved ? Constants.REMOVE_SAVES_LIKES : Constants.ADD_SAVES_LIKES;
                        break;
                    default:
                        break;
                }

                setIsPostLiked(_isPostLiked);
                setIsPostSaved(_isPostSaved);

                if (data?.reaction && mode && url) {
                    API(Constants.POST, url, data, headerData);
                    setPostDetails({ ...postObj });
                }
            } else {
                showError(`Please login to ${action}!`);
            }
        }
    }

    return (
        <div>
            <Card className="post-card">
                <img
                    alt="user"
                    className="post-user-image"
                    style={{ width: "50px", height: "50px" }}
                    src={postDetails?.picture ?? Constants.placeHolderImageSrc}
                />

                <div className="post-card-body" style={{ marginLeft: "70px", marginTop: "20px" }}>
                    <div className="row mx-0" style={{ fontSize: "18px" }}>
                        <b>{postDetails?.user?.name ?? ''}</b>&nbsp;
                        <span>{`@${postDetails?.user?.username ?? ''}`}</span>
                        <span><div className="seperator-container"><div className="seperator" /></div></span>
                        <span>{getPostTiming(postDetails?.createdAt ?? null)}</span>
                    </div>

                    <div className="row mx-0" style={{ fontSize: "20px" }}><div>{postDetails?.text ?? ''}</div></div>

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
                                    className="parent-post-user-img"
                                    style={{ width: "45px", height: "45px" }}
                                    src={postDetails?.parentPostDetails?.user?.picture ?? Constants.placeHolderImageSrc}
                                />

                                <div className="repost-body-content" style={{ marginLeft: "60px" }}>
                                    <div className="row mx-0" style={{ fontSize: "18px" }}>
                                        <b>{postDetails?.parentPostDetails?.user?.name ?? ''}</b>&nbsp;

                                        <span>{`@${postDetails?.parentPostDetails?.user?.username ?? ''}`}</span>

                                        <span>
                                            <div className="seperator-container"><div className="seperator" /></div>
                                        </span>

                                        <span>{getPostTiming(postDetails?.parentPostDetails?.createdAt)}</span>
                                    </div>

                                    <div style={{ fontSize: "20px" }} className="row mx-0 mt-1 font-size-16">
                                        <div>{postDetails?.parentPostDetails?.text?.slice(0, 40) ?? ''}</div>
                                    </div>

                                    {
                                        postDetails?.parentPostDetails?.images?.length > 0 && (
                                            <ImgHolder images={postDetails?.parentPostDetails?.images} showActionButtons={false} />
                                        )
                                    }
                                </div>
                            </div>
                        )
                    }

                    <div className="action-bar">
                        <div onClick={openCommentBox} className="reaction-icon-container reply-container">
                            <span className="reply-icon">
                                <CIcon title="Reply" icon={cilCommentBubble} className="chirp-action" />
                            </span>

                            <span className="post-reaction-data">{postDetails?.comments ?? 0}</span>
                        </div>

                        <div onClick={openRepostBox} className="reaction-icon-container repost-container">
                            <span className="reply-icon">
                                <CIcon icon={cilSend} title="Repost" className="chirp-action" />
                            </span>

                            <span className="post-reaction-data">{postDetails?.reposts ?? 0}</span>
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
                                {postDetails?.likes ?? 0}
                            </span>
                        </div>

                        <div className="reaction-icon-container views-container" onClick={e => { e.stopPropagation(); }}>
                            <span className="reply-icon">
                                <CIcon title="Views" icon={cilChart} className="chirp-action" />
                            </span>

                            <span style={{ paddingTop: "13%" }} className="post-reaction-data">{postDetails?.views ?? 0}</span>
                        </div>

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
                                {postDetails?.saved ?? 0}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            <ReplyBox username={postDetails?.user?.username} />

            <CommentList commentList={commentList} />
        </div>
    );
}

export default PostDetails;
