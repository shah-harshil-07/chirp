import "src/styles/reactions/post-details.css";

import API from "src/api";
import CIcon from "@coreui/icons-react";
import { Card } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { cilChart, cilCommentBubble, cilSend, cilThumbUp } from "@coreui/icons";

import Loader from "src/components/utilities/loader";
import * as Constants from "src/utilities/constants";
import DisplayedText from "../utilities/displayed-text";
import useToaster from "src/custom-hooks/toaster-message";
import ImgHolder from "src/components/utilities/img-holder";
import usePostServices from "src/custom-hooks/post-services";
import { getCommonHeader, isUserLoggedIn } from "src/utilities/helpers";

const CommentList = ({ commentList, userImages, isLoading }) => {
    const navigate = useNavigate();
    const { showError } = useToaster();
    const headerData = getCommonHeader();
    const likeIcon = require("src/assets/like.png");
    const sampleUserImg = require("src/assets/sample-user.png");
    const {
        openUserCard,
        getPostTiming,
        openRepostBox,
        closeUserCard,
        moveToUserPage,
        openCommentBox,
        getFormattedNumber,
        handleMutedReaction,
        getImageFetchingPromise,
        closeDetailsCardImmediately,
    } = usePostServices();

    const [comments, setComments] = useState([]);

    useEffect(() => {
        if (commentList?.length) {
            setComments([...commentList]);
            const imageNames = commentList.map(comment => comment.images);
            getCommentImages(imageNames, commentList);
            if (isUserLoggedIn()) getCommentLikesAndSaves(commentList);
        }

        // eslint-disable-next-line
    }, [commentList]);

    const getPromise = (imageName, commentIndex, imageIndex, _comments) => {
        const successCallback = imageData => {
            if (!_comments?.[commentIndex]?.images) _comments[commentIndex]["images"] = [];
            _comments[commentIndex]["images"][imageIndex] = imageData;
            setComments([..._comments]);
        }

        return getImageFetchingPromise(imageName, successCallback);
    }

    const getCommentImages = (imageNameSuperList, comments) => {
        const promises = [];

        imageNameSuperList.forEach((imageNames, commentIndex) => {
            imageNames.forEach((imageName, imageIndex) => {
                const params = [imageName, commentIndex, imageIndex, comments];
                promises.push(getPromise(...params));
            });
        });

        Promise.allSettled(promises);
    }

    const getCommentLikesAndSaves = async comments => {
        const payload = { postIds: comments.map(comment => comment.id) };
        const { data: reactionData } = await API(Constants.POST, Constants.GET_POST_LIKES_AND_SAVES, payload, headerData);

        const _comments = [...comments], reactedPosts = reactionData?.data ?? [];

        _comments.forEach(commentObj => {
            const { id } = commentObj;
            const reactedPostObj = reactedPosts.find(post => post.postId === id) ?? null;
            commentObj["isLiked"] = reactedPostObj?.liked ?? false;
            commentObj["isSaved"] = reactedPostObj?.saved ?? false;
        });

        setComments([..._comments]);
    }

    const triggerMutedReaction = async (e, commentIndex, action) => {
        e.stopPropagation();
        const _comments = comments, commentObj = comments[commentIndex];

        const handleLikeAction = mode => {
            commentObj["isLiked"] = mode === "add";
            commentObj["likes"] += mode === "add" ? 1 : -1;
            setComments([..._comments]);
        }

        const handleSaveAction = mode => {
            commentObj["isSaved"] = mode === "add";
            commentObj["saved"] += mode === "add" ? 1 : -1;
            setComments([..._comments]);
        }

        const commentData = { ...commentObj, postId: commentObj.id, postType: "comment" };
        handleMutedReaction(action, commentData, handleLikeAction, handleSaveAction);
    }

    const callMoveToUserPageFn = (e, userId) => {
        closeDetailsCardImmediately();
        moveToUserPage(e, userId);
    }

    const moveToCommentDetailPage = commentId => {
        if (commentId) {
            navigate(`/post/${commentId}`, { state: { type: "comment" } });
            navigate(0);
        } else {
            showError("comment id is unavailable.");
        }
    }

    const triggerVocalReaction = (e, commentDetails, reactionType) => {
        e.stopPropagation();

        let reactionFn = null;
        if (reactionType === "repost") reactionFn = openRepostBox;
        else if (reactionType === "comment") reactionFn = openCommentBox;

        const data = JSON.parse(JSON.stringify(commentDetails ?? {}));

        data["type"] = "comment";
        if (data?.user?.picture) data.user.picture = userImages?.[commentDetails?.user?.userId ?? '0'] ?? '';
        if (reactionFn) reactionFn(e, data); else showError("Something went wrong!");
    }

    return isLoading ? <Loader /> : commentList.map((commentObj, commentIndex) => {
        const { user, text, createdAt, likes, comments, views, images, id, reposts } = commentObj;
        const { userId, name, username } = user ?? {};

        return (
            <Card className="mt-3 comment-card" onClick={() => { moveToCommentDetailPage(id); }} key={commentIndex}>
                <img
                    alt="user"
                    onMouseOut={closeUserCard}
                    className="post-detail-user-image"
                    src={userImages[userId] ?? String(sampleUserImg)}
                    onClick={e => { callMoveToUserPageFn(e, userId); }}
                    onError={e => { e.target.src = String(sampleUserImg); }}
                    onMouseOver={e => { openUserCard(e, user, userImages[userId]); }}
                />

                <div id="comment-container">
                    <div className="row mx-0 font-size-18">
                        <b>{name ?? ''}</b>&nbsp;
                        {username && <span>{`@${username}`}</span>}
                        <span><div className="seperator-container"><div className="seperator" /></div></span>
                        <span>{getPostTiming(createdAt)}</span>
                    </div>

                    <div className="row mx-0 font-size-20">
                        <div><DisplayedText parentType="comment-body" text={text} /></div>
                    </div>

                    {images?.length > 0 && <ImgHolder images={images} showActionButtons={false} />}

                    <div className="action-bar">
                        <div
                            className="reaction-icon-container like-container"
                            onClick={e => { triggerMutedReaction(e, commentIndex, "like"); }}
                        >
                            <span className="reply-icon" style={commentObj?.isLiked ? { paddingTop: "6px" } : {}}>
                                {
                                    commentObj?.isLiked ? (
                                        <img width="20" height="20" src={String(likeIcon)} alt="like" />
                                    ) : (
                                        <CIcon title="Like" icon={cilThumbUp} className="chirp-action" />
                                    )
                                }
                            </span>

                            <span
                                className="post-reaction-data"
                                style={commentObj?.isLiked ? { color: "var(--liked-color)" } : {}}
                            >
                                {getFormattedNumber(likes ?? 0)}
                            </span>
                        </div>

                        <div
                            className="reaction-icon-container reply-container"
                            onClick={e => { triggerVocalReaction(e, commentObj, "comment"); }}
                        >
                            <span className="reply-icon">
                                <CIcon title="Reply" icon={cilCommentBubble} className="chirp-action" />
                            </span>

                            <span className="post-reaction-data">{getFormattedNumber(comments ?? 0)}</span>
                        </div>

                        <div
                            className="reaction-icon-container repost-container"
                            onClick={e => { triggerVocalReaction(e, commentObj, "repost"); }}
                        >
                            <span className="reply-icon">
                                <CIcon icon={cilSend} title="Repost" className="chirp-action" />
                            </span>

                            <span className="post-reaction-data">{getFormattedNumber(reposts ?? 0)}</span>
                        </div>

                        <div
                            onClick={e => { e.stopPropagation(); }}
                            className="reaction-icon-container views-container"
                        >
                            <span className="reply-icon">
                                <CIcon title="Views" icon={cilChart} className="chirp-action" />
                            </span>

                            <span className="post-reaction-data">{getFormattedNumber(views ?? 0)}</span>
                        </div>
                    </div>
                </div>
            </Card>
        );
    });
};

export default CommentList;
