import { Card } from "@material-ui/core";
import React, { useEffect, useState } from "react";

import API from "src/api";
import CIcon from "@coreui/icons-react";
import { cilBookmark, cilChart, cilThumbUp } from "@coreui/icons";

import * as Constants from "src/utilities/constants";
import useToaster from "src/custom-hooks/toaster-message";
import ImgHolder from "src/components/utilities/img-holder";
import usePostServices from "src/custom-hooks/post-services";
import { getCommonHeader, isUserLoggedIn } from "src/utilities/helpers";

const CommentList = ({ commentList }) => {
    const { showError } = useToaster();
    const headerData = getCommonHeader();
    const { getPostTiming } = usePostServices();
    const likeIcon = require("src/assets/like.png");
    const savedIcon = require("src/assets/saved-filled.png");

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
        return new Promise((res, rej) => {
            API(Constants.GET, `${Constants.GET_POST_IMAGE}/${imageName}`, null, headerData)
                .then(imageResponse => {
                    const base64ImgData = imageResponse.data;
                    const base64Prefix = "data:image/*;charset=utf-8;base64,";
                    const imageData = base64Prefix + base64ImgData;

                    if (!_comments?.[commentIndex]?.images) _comments[commentIndex]["images"] = [];
                    _comments[commentIndex]["images"][imageIndex] = imageData;
                    setComments([..._comments]);
                    res();
                })
                .catch(err => {
                    console.log(err);
                    rej();
                });
        });
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
        if (isUserLoggedIn()) {
            console.log(comments, commentIndex);
            const _comments = comments, commentObj = comments[commentIndex];
			const { id: postId, isLiked, isSaved } = commentObj;
            const data = { postId, postType: "comment", reaction: '' }; let mode, url;

            switch (action) {
                case "like":
                    data["reaction"] = "liked";
                    mode = isLiked ? "remove" : "add";
                    commentObj["isLiked"] = mode === "add";
                    commentObj["likes"] += mode === "add" ? 1 : -1;
                    url = isLiked ? Constants.REMOVE_SAVES_LIKES : Constants.ADD_SAVES_LIKES;
                    break;
                case "save":
                    data["reaction"] = "saved";
                    mode = isSaved ? "remove" : "add";
                    commentObj["isSaved"] = mode === "add";
                    commentObj["saved"] += mode === "add" ? 1 : -1;
                    url = isSaved ? Constants.REMOVE_SAVES_LIKES : Constants.ADD_SAVES_LIKES;
                    break;
                default:
                    break;
            }

            if (data?.reaction && mode && url) {
                API(Constants.POST, url, data, headerData);
                setComments([..._comments]);
            }
        } else {
            showError(`Please login to ${action}!`);
        }
    }

    return (
        <>
            {
                commentList.map((commentObj, commentIndex) => {
                    const { user, text, createdAt, likes, saved, views, images } = commentObj;
                    const { name, picture, username } = user ?? {};

                    return (
                        <Card className="mt-3" key={commentIndex}>
                            <img
                                alt="user"
                                className="post-user-image"
                                style={{ width: "50px", height: "50px" }}
                                src={picture ?? Constants.placeHolderImageSrc}
                            />

                            <div className="post-card-body" style={{ marginLeft: "70px", marginTop: "20px" }}>
                                <div className="row mx-0" style={{ fontSize: "18px" }}>
                                    <b>{name ?? ''}</b>&nbsp;
                                    {username && <span>{`@${username}`}</span>}
                                    <span><div className="seperator-container"><div className="seperator" /></div></span>
                                    <span>{getPostTiming(createdAt)}</span>
                                </div>

                                <div className="row mx-0" style={{ fontSize: "20px" }}><div>{text ?? ''}</div></div>

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
                                            {likes ?? 0}
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
                                            {saved ?? 0}
                                        </span>
                                    </div>

                                    <div className="reaction-icon-container views-container" onClick={e => { e.stopPropagation(); }}>
                                        <span className="reply-icon">
                                            <CIcon title="Views" icon={cilChart} className="chirp-action" />
                                        </span>

                                        <span className="post-reaction-data">{views ?? 0}</span>
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
