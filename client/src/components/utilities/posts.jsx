import "src/styles/post.css";
import "src/styles/user/posts.css";

import CIcon from "@coreui/icons-react";
import { Card } from "@material-ui/core/";
import { useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cilSend, cilCommentBubble, cilChart, cilThumbUp, cilBookmark } from "@coreui/icons";

import API from "src/api";
import Loader from "./loader";
import ImgHolder from "./img-holder";
import * as Constants from "src/utilities/constants";
import { isUserLoggedIn } from "src/utilities/helpers";
import { getCommonHeader } from "src/utilities/helpers";
import { openToaster } from "src/redux/reducers/toaster";
import useToaster from "src/custom-hooks/toaster-message";
import usePostServices from "src/custom-hooks/post-services";
import { closeDetailsCard, openDetailsCard } from "src/redux/reducers/user-details";

const PostUtilities = ({ parentName }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const headerData = getCommonHeader();
    const likeIcon = require("src/assets/like.png");
    const savedIcon = require("src/assets/saved-filled.png");
    const sampleUserImg = require("src/assets/sample-user.png");
    const { showError } = useToaster(), dispatch = useDispatch();
    const userDetails = localStorage.getItem("chirp-userDetails");
    const loggedInUserId = userDetails ? JSON.parse(userDetails)?._id ?? '' : '';
    const {
        getPostTiming,
        createPollJSX,
        openRepostBox,
        openCommentBox,
        handleMutedReaction,
        getImageFetchingPromise,
    } = usePostServices();

    const [posts, setPosts] = useState([]);
    const [postImages, setPostImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        getPosts();
        // eslint-disable-next-line
    }, [parentName]);

    const getPosts = async () => {
        try {
            setIsLoading(true);
            let _posts = [], images = [];
            switch (parentName) {
                case "user":
                    const { data: userPostResponseData } = await API(Constants.GET, `${Constants.GET_USER_POSTS}/${userId}`);
                    if (userPostResponseData?.data?.posts?.length) _posts = userPostResponseData.data.posts;
                    break;
                case "saved":
                    const { data: savedPostResponseData } = await API(Constants.GET, `${Constants.GET_SAVED_POSTS}/${userId}`);
                    if (savedPostResponseData?.data?.length) _posts = savedPostResponseData.data;
                    break;
                default:
                    const { data: generalPostResponseData } = await API(Constants.GET, Constants.GET_POSTS);
                    if (generalPostResponseData?.data?.length) _posts = generalPostResponseData.data;
                    break;
            }

            setIsLoading(false);

            _posts.forEach(postObj => {
                postObj["isLiked"] = null;
                const { images: postImages, post } = postObj;
                if (post?.images?.length) postImages.push(post.images);
                images.push(postImages);
            });

            getPostImages(images);
            setPosts([..._posts]);
            if (isUserLoggedIn()) getPostLikesAndSaves(_posts);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    const getPromise = (imageName, postIndex, imageIndex, _postImages, parentImageIndex) => {
        const successCallback = imageData => {
            if (parentImageIndex >= 0) {
                if (!_postImages[postIndex][imageIndex]) _postImages[postIndex][imageIndex] = [];
                _postImages[postIndex][imageIndex][parentImageIndex] = imageData;
            } else {
                _postImages[postIndex][imageIndex] = imageData;
            }

            setPostImages([..._postImages]);
        }

        return getImageFetchingPromise(imageName, successCallback);
    }

    const getPostImages = postImageNameArr => {
        const promises = [];

        postImageNameArr.forEach((postImageNames, postIndex) => {
            postImageNames.forEach((imageName, imageIndex) => {
                const _postImages = postImages;
                if (!_postImages[postIndex]) _postImages[postIndex] = [];
                const params = [imageName, postIndex, imageIndex, _postImages];

                if (Array.isArray(imageName)) {
                    imageName.forEach((image, imageIndex) => {
                        params[0] = image;
                        promises.push(getPromise(...params, imageIndex));
                    });
                } else {
                    promises.push(getPromise(...params));
                }
            });
        });

        Promise.allSettled(promises);
    }

    const getPostLikesAndSaves = async posts => {
        const data = { postIds: posts.map(post => post._id) };
        const { data: reactionData } = await API(Constants.POST, Constants.GET_POST_LIKES_AND_SAVES, data, headerData);

        const _posts = posts, reactedPosts = reactionData?.data ?? [];

        _posts.forEach(postObj => {
            const { _id: id } = postObj;
            const reactedPostObj = reactedPosts.find(post => post.postId === id) ?? null;
            postObj["isLiked"] = reactedPostObj?.liked ?? false;
            postObj["isSaved"] = reactedPostObj?.saved ?? false;
        });

        setPosts([..._posts]);
    }

    const vote = async (e, postIndex, choiceIndex) => {
        e.stopPropagation();
        const _posts = posts;
        const pollObj = _posts[postIndex].poll;
        const { users, choices } = pollObj;

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

            const data = { postId: posts[postIndex]._id, choiceIndex, prevChoiceIndex };

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
            setPosts([..._posts]);
        } else {
            showError("Please login to vote!");
        }
    }

    const getPollJSX = (pollData, postIndex) => {
        return createPollJSX(pollData, (e, choiceIndex) => { vote(e, postIndex, choiceIndex); });
    }

    const triggerMutedReaction = async (e, postIndex, action) => {
        e.stopPropagation();
        const _posts = posts, postObj = posts[postIndex];

        const handleLikeAction = mode => {
            postObj["isLiked"] = mode === "add";
            postObj["likes"] += mode === "add" ? 1 : -1;
            setPosts([..._posts]);
        }

        const handleSaveAction = mode => {
            postObj["isSaved"] = mode === "add";
            postObj["saved"] += mode === "add" ? 1 : -1;
            setPosts([..._posts]);
        }

        const postData = { ...postObj, postId: postObj._id };
        handleMutedReaction(action, postData, handleLikeAction, handleSaveAction);
    }

    const moveToCommentList = postId => {
        closeDetailsCardImmediately();
        navigate(`/post/${postId}`, { preventScrollReset: false });
    }

    const openUserCard = (e, userDetails) => {
        e.stopPropagation();
        const imgRect = e.target.getBoundingClientRect();
        const coordinates = { left: imgRect.left - 130, top: window.scrollY + imgRect.bottom + 10 };
        dispatch(openDetailsCard({ ...userDetails, coordinates }));
    }

    const closeDetailsCardImmediately = () => {
        dispatch(closeDetailsCard());
        document.removeEventListener("mousemove", () => { });
    }

    const closeUserCard = e => {
        e.stopPropagation();
        let clientX = 0, clientY = 0;
        document.addEventListener("mousemove", e => {
            clientX = e.clientX;
            clientY = e.clientY;
        });

        setTimeout(() => {
            const currentHoveredElement = document.elementFromPoint(clientX, clientY);
            const pointerContainsCard = document.getElementById("user-card-body")?.contains(currentHoveredElement);
            if (!pointerContainsCard && !e.target.contains(currentHoveredElement)) dispatch(closeDetailsCard());
            document.removeEventListener("mousemove", () => { });
        }, 2000);
    }

    const moveToUserPage = (e, userId) => {
        e.stopPropagation();
        closeDetailsCardImmediately();
        navigate(`/user/${userId}`);
    }

    return (
        <div>
            {isLoading && <Loader />}

            {
                posts.map((post, postIndex) => {
                    const { post: parentPost, createdAt, isLiked, isSaved, _id: postId } = post;
                    const { likes, reposts, comments, views, saved, } = post;
                    const { name, username, picture, _id: userId } = post.user ?? {};
                    let parentPostImages = [], pureImages = [];
                    const images = postImages[postIndex];

                    const { text: parentPostText, createdAt: parentCreatedAt, user: parentPostUser } = parentPost ?? {};
                    const {
                        name: parentName,
                        _id: parentUserId,
                        picture: parentPicture,
                        username: parentUserName,
                    } = parentPostUser ?? {};

                    if (images?.length) {
                        images.forEach(image => {
                            if (Array.isArray(image)) parentPostImages = [...image];
                            else if (image) pureImages.push(image);
                        });
                    }

                    return name && username ? (
                        <Card className="post-card" key={postId} onClick={() => { moveToCommentList(postId); }}>
                            <img
                                alt="user"
                                onMouseOut={closeUserCard}
                                className="post-user-image"
                                src={picture ?? String(sampleUserImg)}
                                onClick={e => { moveToUserPage(e, userId); }}
                                onMouseOver={e => { openUserCard(e, post?.user); }}
                                onError={e => { e.target.src = String(sampleUserImg); }}
                            />

                            <div className="post-card-body">
                                <div className="row mx-3">
                                    <b>{name}</b>&nbsp;
                                    <span>{`@${username}`}</span>
                                    <span><div className="seperator-container"><div className="seperator" /></div></span>
                                    <span>{getPostTiming(createdAt)}</span>
                                </div>

                                <div className="row mx-3"><div>{post?.text ?? ''}</div></div>

                                {post?.poll?.choices && getPollJSX(post.poll, postIndex)}
                                {
                                    pureImages?.length > 0 && (
                                        <ImgHolder images={pureImages} showActionButtons={false} />
                                    )
                                }

                                {
                                    parentPostUser && (
                                        <div
                                            className="repost-body user-post-list-repost-body"
                                            style={{ marginTop: pureImages.length ? "10px" : '0' }}
                                        >
                                            <img
                                                alt="post creator"
                                                onMouseOut={closeUserCard}
                                                className="parent-post-user-img"
                                                src={parentPicture ?? String(sampleUserImg)}
                                                onClick={e => { moveToUserPage(e, parentUserId); }}
                                                onMouseOver={e => { openUserCard(e, parentPostUser); }}
                                                onError={e => { e.target.src = String(sampleUserImg); }}
                                            />

                                            <div className="repost-body-content">
                                                <div className="row mx-0">
                                                    <b className="font-size-16">{parentName}</b>&nbsp;
                                                    <span className="font-size-16">{`@${parentUserName}`}</span>
                                                    <span>
                                                        <div className="seperator-container">
                                                            <div className="seperator" />
                                                        </div>
                                                    </span>
                                                    <span className="font-size-16">{getPostTiming(parentCreatedAt)}</span>
                                                </div>

                                                <div className="row mx-0 mt-1 font-size-16">
                                                    <div>{parentPostText?.slice(0, 40) ?? ''}</div>
                                                </div>

                                                {
                                                    parentPostImages?.length > 0 && (
                                                        <ImgHolder images={parentPostImages} showActionButtons={false} />
                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                }

                                <div className="action-bar">
                                    <div
                                        onClick={e => { openCommentBox(e, post); }}
                                        className="reaction-icon-container reply-container"
                                    >
                                        <span className="reply-icon">
                                            <CIcon title="Reply" icon={cilCommentBubble} className="chirp-action" />
                                        </span>

                                        <span className="post-reaction-data">{comments ?? 0}</span>
                                    </div>

                                    <div
                                        onClick={e => { openRepostBox(e, post); }}
                                        className="reaction-icon-container repost-container"
                                    >
                                        <span className="reply-icon">
                                            <CIcon icon={cilSend} title="Repost" className="chirp-action" />
                                        </span>

                                        <span className="post-reaction-data">{reposts ?? 0}</span>
                                    </div>

                                    <div
                                        className="reaction-icon-container like-container"
                                        onClick={e => { triggerMutedReaction(e, postIndex, "like"); }}
                                    >
                                        <span className="reply-icon" style={isLiked ? { paddingTop: "6px" } : {}}>
                                            {
                                                isLiked ? (
                                                    <img width="20" height="20" src={String(likeIcon)} alt="like" />
                                                ) : (
                                                    <CIcon title="Like" icon={cilThumbUp} className="chirp-action" />
                                                )
                                            }
                                        </span>

                                        <span
                                            className="post-reaction-data"
                                            style={isLiked ? { color: "var(--liked-color)" } : {}}
                                        >
                                            {likes ?? 0}
                                        </span>
                                    </div>

                                    <div
                                        onClick={e => { e.stopPropagation(); }}
                                        className="reaction-icon-container views-container"
                                    >
                                        <span className="reply-icon">
                                            <CIcon title="Views" icon={cilChart} className="chirp-action" />
                                        </span>

                                        <span className="post-reaction-data">{views ?? 0}</span>
                                    </div>

                                    <div
                                        className="reaction-icon-container saved-container"
                                        onClick={e => { triggerMutedReaction(e, postIndex, "save"); }}
                                    >
                                        <span className="reply-icon" style={isSaved ? { paddingTop: "6px" } : {}}>
                                            {
                                                isSaved ? (
                                                    <img width="20" height="20" src={String(savedIcon)} alt="like" />
                                                ) : (
                                                    <CIcon title="Bookmark" icon={cilBookmark} className="chirp-action" />
                                                )
                                            }
                                        </span>

                                        <span
                                            className="post-reaction-data"
                                            style={isSaved ? { color: "var(--saved-color)" } : {}}
                                        >
                                            {saved ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <></>
                    );
                })
            }
        </div>
    );
};

export default PostUtilities;
