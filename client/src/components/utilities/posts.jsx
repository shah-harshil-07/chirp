import "src/styles/user/posts.css";
import "src/styles/utilities/post.css";

import CIcon from "@coreui/icons-react";
import { Card } from "@material-ui/core/";
import { useDispatch } from "react-redux";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cilSend, cilCommentBubble, cilChart, cilThumbUp, cilBookmark } from "@coreui/icons";

import API from "src/api";
import Loader from "./loader";
import ImgHolder from "./img-holder";
import DisplayedText from "./displayed-text";
import * as Constants from "src/utilities/constants";
import { isUserLoggedIn } from "src/utilities/helpers";
import { getCommonHeader } from "src/utilities/helpers";
import { openToaster } from "src/redux/reducers/toaster";
import useToaster from "src/custom-hooks/toaster-message";
import usePostServices from "src/custom-hooks/post-services";
import { closeDetailsCard, openDetailsCard } from "src/redux/reducers/user-details";

const PostUtilities = ({ parentName }) => {
    const eopRef = useRef(null);
    const { userId } = useParams();
    const navigate = useNavigate();
    const postUtilityTheme = parentName;
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
        getFormattedNumber,
        handleMutedReaction,
        getImageFetchingPromise,
    } = usePostServices();

    const [posts, setPosts] = useState([]);
    const [topupCount, setTopupCount] = useState(0);
    const [postImages, setPostImages] = useState([]);
    const [userImages, setUserImages] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userComments, setUserComments] = useState([]);
    const [morePostsAvailable, setMorePostsAvailable] = useState(true);

    useEffect(() => {
        const observer = new IntersectionObserver(([loadMoreElement]) => {
            if (loadMoreElement.isIntersecting && morePostsAvailable) {
                const _topupCount = topupCount + Constants.topupCountIncrementValue;
                setTopupCount(_topupCount);
                getPosts(_topupCount);
            }
        }, { rootMargin: "-80px" });

        observer.observe(eopRef.current);

        return () => { observer.disconnect(); };
        // eslint-disable-next-line
    }, [parentName, posts, morePostsAvailable]);

    const getPosts = async topupCount => {
        try {
            setIsLoading(true);
            let _posts = [], images = [], url = '';
            console.log("topupCount => ", topupCount);
            switch (parentName) {
                case "user":
                    url = `${Constants.GET_USER_POSTS}/${userId}`;
                    break;
                case "comments":
                    url = `${Constants.GET_USER_COMMENTS}/${userId}`;
                    break;
                case "saved":
                    url = `${Constants.GET_SAVED_POSTS}/${userId}`;
                    break;
                default:
                    url = Constants.GET_POSTS;
                    break;
            }

            const { data: responseData } = await API(Constants.GET, url);
            if (responseData?.data?.length) _posts = [...posts, ...topupCount < 15 ? responseData?.data : []];
            // if (responseData?.data?.length) _posts = [...posts, ...responseData?.data];
            setMorePostsAvailable(topupCount < 15);

            const comments = [], _userImages = {};

            _posts.forEach(async postObj => {
                postObj["isLiked"] = null;
                const { images: postImages, post } = postObj;
                if (post?.images?.length) postImages.push(post.images);
                images.push(postImages);

                const { _id: userId, picture: userPic } = postObj?.user ?? {};
                const { _id: parentUserId, picture: parentUserPic } = postObj?.post?.user ?? {};

                if (userPic) _userImages[userId] = userPic;
                if (parentUserPic) _userImages[parentUserId] = parentUserPic;
                if (postUtilityTheme === "comments") comments.push(postObj.comment);
            });

            for (const userId in _userImages) {
                const imageValue = _userImages[userId];
                if (!imageValue.startsWith(Constants.httpsOrigin)) {
                    await getImageFetchingPromise(imageValue, imageData => { _userImages[userId] = imageData; }, "user");
                }
            }

            setUserImages({ ..._userImages });

            if (comments?.length && postUtilityTheme === "comments") {
                const imageNames = comments.map(comment => comment.images);
                getCommentImages(imageNames, comments);
            }

            getPostImages(images);
            setPosts([..._posts]);
            setIsLoading(false);
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

    const getCommentImgPromise = (imageName, commentIndex, imageIndex, _comments) => {
        const successCallback = imageData => {
            if (!_comments?.[commentIndex]?.images) _comments[commentIndex]["images"] = [];
            _comments[commentIndex]["images"][imageIndex] = imageData;
            setUserComments([..._comments]);
        }

        return getImageFetchingPromise(imageName, successCallback);
    }

    const getCommentImages = (imageNameSuperList, comments) => {
        const promises = [];

        imageNameSuperList.forEach((imageNames, commentIndex) => {
            imageNames.forEach((imageName, imageIndex) => {
                const params = [imageName, commentIndex, imageIndex, comments];
                promises.push(getCommentImgPromise(...params));
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

    const triggerVocalReaction = (e, postObj, reactionType, images) => {
        e.stopPropagation();
        let reactionFn = null;
        if (reactionType === "repost") reactionFn = openRepostBox;
        else if (reactionType === "comment") reactionFn = openCommentBox;
        const data = JSON.parse(JSON.stringify(postObj ?? {}));

        data["id"] = data?._id ?? '';
        data["images"] = images ?? [];
        if (data?.user?.picture) data.user.picture = userImages?.[postObj?.user?._id ?? '0'] ?? '';
        if (reactionFn) reactionFn(e, data); else showError("Something went wrong!");
    }

    const moveToCommentList = (e, postId, type = "post") => {
        e.stopPropagation();
        closeDetailsCardImmediately();
        navigate(`/post/${postId}`, { preventScrollReset: false, state: { type } });
    }

    const openUserCard = (e, userDetails) => {
        e.stopPropagation();
        const { _id: userId } = userDetails;
        const picture = userImages?.[userId] ?? '';
        const imgRect = e.target.getBoundingClientRect();
        const coordinates = { left: imgRect.left - 130, top: window.scrollY + imgRect.bottom + 10 };
        dispatch(openDetailsCard({ ...userDetails, picture, coordinates }));
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

        if (userId) {
            closeDetailsCardImmediately();
            navigate(`/user/${userId}`);
        } else {
            showError("user id is unavailable.");
        }
    }

    const getRepostStyles = imageLength => {
        const styles = { marginTop: '0' };
        if (imageLength > 0) styles["marginTop"] = "10px";
        return styles;
    }

    return (
        <div className={!posts?.length ? "no-posts-box" : ''}>
            {!posts?.length && !isLoading && <i>No posts are available</i>}
            {
                posts.map((post, postIndex) => {
                    const { post: parentPost, createdAt, isLiked, isSaved, _id: postId } = post;
                    const { likes, reposts, comments, views, saved } = post;
                    const { name, username, _id: userId } = post.user ?? {};
                    let parentPostImages = [], pureImages = [];
                    const images = postImages[postIndex];

                    const commentObj = userComments?.[postIndex];
                    const { _id: commentId } = commentObj ?? {};

                    const {
                        type: parentType,
                        _id: parentPostId,
                        text: parentPostText,
                        user: parentPostUser,
                        createdAt: parentCreatedAt,
                    } = parentPost ?? {};
                    const { name: parentName, _id: parentUserId, username: parentUserName } = parentPostUser ?? {};

                    if (images?.length) {
                        images.forEach(image => {
                            if (Array.isArray(image)) parentPostImages = [...image];
                            else if (image) pureImages.push(image);
                        });
                    }

                    return name && username ? (
                        <Card
                            key={postIndex}
                            className="post-card"
                            onClick={e => { moveToCommentList(e, postId); }}
                        >
                            <img
                                alt="user"
                                onMouseOut={closeUserCard}
                                className="post-user-image"
                                onClick={e => { moveToUserPage(e, userId); }}
                                src={userImages[userId] ?? String(sampleUserImg)}
                                onMouseOver={e => { openUserCard(e, post?.user); }}
                                onError={e => { e.target.src = String(sampleUserImg); }}
                            />

                            <div className="post-card-body">
                                <div className="row mx-3">
                                    <b>{name}</b>&nbsp;
                                    <span>{`@${username}`}</span>
                                    <span>
                                        <div className="seperator-container"><div className="seperator" /></div>
                                    </span>
                                    <span>{getPostTiming(createdAt)}</span>
                                </div>

                                <div className="row mx-3">
                                    <div>
                                        <DisplayedText
                                            uniqueId={postId}
                                            text={post?.text ?? ''}
                                            parentType={"post-list-body"}
                                            readMoreAction={e => { moveToCommentList(e, postId); }}
                                        />
                                    </div>
                                </div>

                                {post?.poll?.choices && getPollJSX(post.poll, postIndex)}
                                {
                                    pureImages?.length > 0 && (
                                        <ImgHolder images={pureImages} showActionButtons={false} />
                                    )
                                }

                                {
                                    parentPostUser && (
                                        <div
                                            style={getRepostStyles(pureImages?.length)}
                                            className="repost-body user-post-list-repost-body"
                                            onClick={e => { moveToCommentList(e, parentPostId, parentType); }}
                                        >
                                            <img
                                                alt="post creator"
                                                onMouseOut={closeUserCard}
                                                className="parent-post-user-img"
                                                onClick={e => { moveToUserPage(e, parentUserId); }}
                                                src={userImages[parentUserId] ?? String(sampleUserImg)}
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
                                                    <span className="font-size-16">
                                                        {getPostTiming(parentCreatedAt)}
                                                    </span>
                                                </div>

                                                <div className="row mx-0 mt-1 font-size-16">
                                                    <div>
                                                        <DisplayedText
                                                            uniqueId={parentPostId}
                                                            text={parentPostText ?? ''}
                                                            parentType={"user-comment"}
                                                            readMoreAction={e => {
                                                                moveToCommentList(e, parentPostId, parentType);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {
                                                    parentPostImages?.length > 0 && (
                                                        <ImgHolder
                                                            images={parentPostImages}
                                                            showActionButtons={false}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                }

                                <div className="action-bar">
                                    <div
                                        className="reaction-icon-container reply-container"
                                        onClick={e => { triggerVocalReaction(e, post, "comment"); }}
                                    >
                                        <span className="reply-icon">
                                            <CIcon title="Reply" icon={cilCommentBubble} className="chirp-action" />
                                        </span>

                                        <span className="post-reaction-data">
                                            {getFormattedNumber(comments ?? 0)}
                                        </span>
                                    </div>

                                    <div
                                        className="reaction-icon-container repost-container"
                                        onClick={e => { triggerVocalReaction(e, post, "repost", pureImages); }}
                                    >
                                        <span className="reply-icon">
                                            <CIcon icon={cilSend} title="Repost" className="chirp-action" />
                                        </span>

                                        <span className="post-reaction-data">
                                            {getFormattedNumber(reposts ?? 0)}
                                        </span>
                                    </div>

                                    <div
                                        className="reaction-icon-container like-container"
                                        onClick={e => { triggerMutedReaction(e, postIndex, "like"); }}
                                    >
                                        <span className="reply-icon" style={isLiked ? { paddingTop: "6px" } : {}}>
                                            {
                                                isLiked ? (
                                                    <img
                                                        width="20"
                                                        alt="like"
                                                        height="20"
                                                        src={String(likeIcon)}
                                                    />
                                                ) : (
                                                    <CIcon
                                                        title="Like"
                                                        icon={cilThumbUp}
                                                        className="chirp-action"
                                                    />
                                                )
                                            }
                                        </span>

                                        <span
                                            className="post-reaction-data"
                                            style={isLiked ? { color: "var(--liked-color)" } : {}}
                                        >
                                            {getFormattedNumber(likes ?? 0)}
                                        </span>
                                    </div>

                                    <div
                                        onClick={e => { e.stopPropagation(); }}
                                        className="reaction-icon-container views-container"
                                    >
                                        <span className="reply-icon">
                                            <CIcon title="Views" icon={cilChart} className="chirp-action" />
                                        </span>

                                        <span className="post-reaction-data">
                                            {getFormattedNumber(views ?? 0)}
                                        </span>
                                    </div>

                                    <div
                                        className="reaction-icon-container saved-container"
                                        onClick={e => { triggerMutedReaction(e, postIndex, "save"); }}
                                    >
                                        <span className="reply-icon" style={isSaved ? { paddingTop: "6px" } : {}}>
                                            {
                                                isSaved ? (
                                                    <img
                                                        width="20"
                                                        alt="like"
                                                        height="20"
                                                        src={String(savedIcon)}
                                                    />
                                                ) : (
                                                    <CIcon
                                                        title="Bookmark"
                                                        icon={cilBookmark}
                                                        className="chirp-action"
                                                    />
                                                )
                                            }
                                        </span>

                                        <span
                                            className="post-reaction-data"
                                            style={isSaved ? { color: "var(--saved-color)" } : {}}
                                        >
                                            {getFormattedNumber(saved ?? 0)}
                                        </span>
                                    </div>
                                </div>

                                {
                                    postUtilityTheme === "comments" && commentObj && (
                                        <>
                                            <hr />

                                            <div
                                                className="repost-body user-comment-body"
                                                onClick={e => { moveToCommentList(e, commentId, "comment"); }}
                                                style={commentObj?.images?.length ? { paddingBottom: "15px" } : {}}
                                            >
                                                <img
                                                    alt="post creator"
                                                    className="parent-post-user-img"
                                                    onError={e => e.target.src = String(sampleUserImg)}
                                                    src={commentObj?.user?.picture ?? String(sampleUserImg)}
                                                />

                                                <div className="repost-body-content user-comment-body-content">
                                                    <div className="user-comment-head">
                                                        <b className="font-size-16">
                                                            {commentObj?.user?.name ?? ''}
                                                        </b>&nbsp;

                                                        <span className="font-size-16">
                                                            {`@${commentObj?.user?.username ?? ''}`}
                                                        </span>

                                                        <span>
                                                            <div className="seperator-container">
                                                                <div className="seperator" />
                                                            </div>
                                                        </span>

                                                        <span className="font-size-16">
                                                            {getPostTiming(commentObj?.createdAt)}
                                                        </span>
                                                    </div>

                                                    <div className="user-comment-text">
                                                        <DisplayedText
                                                            parentType={"user-comment"}
                                                            text={commentObj?.text ?? ''}
                                                            readMoreAction={e => {
                                                                moveToCommentList(e, commentId, "comment");
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="user-comment-img-box">
                                                        {
                                                            commentObj?.images?.length > 0 && (
                                                                <ImgHolder
                                                                    showActionButtons={false}
                                                                    images={commentObj?.images ?? []}
                                                                />
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            <span className="user-comment-load-all">Load All Comments</span>
                                        </>
                                    )
                                }
                            </div>
                        </Card>
                    ) : (
                        <></>
                    );
                })
            }

            <div ref={eopRef} id="end-of-posts">
                {isLoading ? <Loader /> : morePostsAvailable ? "Mere paas maa hai!!" : "Tunak tunak tun taara ra..."}
            </div>
        </div>
    );
};

export default PostUtilities;
