import { Card } from "@material-ui/core";
import React, { useEffect, useState } from "react";

import API from "src/api";
import CIcon from "@coreui/icons-react";
import { useNavigate } from "react-router-dom";
import { cilBookmark, cilChart, cilThumbUp } from "@coreui/icons";

import Loader from "src/components/utilities/loader";
import * as Constants from "src/utilities/constants";
import useToaster from "src/custom-hooks/toaster-message";
import ImgHolder from "src/components/utilities/img-holder";
import usePostServices from "src/custom-hooks/post-services";
import { getCommonHeader, isUserLoggedIn } from "src/utilities/helpers";

const CommentList = ({ commentList, userImages, isLoading }) => {
    const navigate = useNavigate();
    const { showError } = useToaster();
    const headerData = getCommonHeader();
    const likeIcon = require("src/assets/like.png");
    const savedIcon = require("src/assets/saved-filled.png");
    const sampleUserImg = require("src/assets/sample-user.png");
    const { getPostTiming, handleMutedReaction, getImageFetchingPromise, getFormattedNumber } = usePostServices();

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

    const moveToUserPage = (e, userId) => {
        if (userId) {
            e.stopPropagation();
            navigate(`/user/${userId}`);
        } else {
            showError("user id is unavailable.");
        }
    }

    return (
        <>
            {isLoading && <Loader />}
            {
                commentList.map((commentObj, commentIndex) => {
                    const { user, text, createdAt, likes, saved, views, images } = commentObj;
                    const { userId, name, username } = user ?? {};

                    return (
                        <Card className="mt-3" key={commentIndex}>
                            <img
                                alt="user"
                                className="post-detail-user-image"
                                onClick={e => { moveToUserPage(e, userId); }}
                                src={userImages[userId] ?? String(sampleUserImg)}
                                onError={e => { e.target.src = String(sampleUserImg); }}
                            />

                            <div id="comment-container">
                                <div className="row mx-0 font-size-18">
                                    <b>{name ?? ''}</b>&nbsp;
                                    {username && <span>{`@${username}`}</span>}
                                    <span><div className="seperator-container"><div className="seperator" /></div></span>
                                    <span>{getPostTiming(createdAt)}</span>
                                </div>

                                <div className="row mx-0 font-size-20"><div>{text ?? ''}</div></div>

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
                                        className="reaction-icon-container saved-container"
                                        onClick={e => { triggerMutedReaction(e, commentIndex, "save"); }}
                                    >
                                        <span className="reply-icon" style={false ? { paddingTop: "6px" } : {}}>
                                            {
                                                commentObj?.isSaved ? (
                                                    <img width="20" height="20" src={String(savedIcon)} alt="like" />
                                                ) : (
                                                    <CIcon title="Bookmark" icon={cilBookmark} className="chirp-action" />
                                                )
                                            }
                                        </span>

                                        <span
                                            className="post-reaction-data"
                                            style={commentObj?.isSaved ? { color: "var(--saved-color)" } : {}}
                                        >
                                            {getFormattedNumber(saved ?? 0)}
                                        </span>
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
                })
            }
        </>
    );
};

export default CommentList;
