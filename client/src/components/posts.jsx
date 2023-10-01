import "src/styles/post.css";

import CIcon from "@coreui/icons-react";
import { Card } from "@material-ui/core/";
import { useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { cilSend, cilCommentBubble, cilChart, cilThumbUp, cilBookmark } from "@coreui/icons";

import API from "src/api";
import ImgHolder from "./utilities/img-holder";
import * as Constants from "src/utilities/constants";
import { isUserLoggedIn } from "src/utilities/helpers";
import { getCommonHeader } from "src/utilities/helpers";
import useToaster from "src/custom-hooks/toaster-message";
import usePostServices from "src/custom-hooks/post-services";
import { openModalWithProps } from "src/redux/actions/modal";
import { placeHolderImageSrc } from "src/utilities/constants";

const Posts = () => {
	const availableMutedActions = ["like", "save"];
	const likeIcon = require("src/assets/like.png");
	const savedIcon = require("src/assets/saved-filled.png");
	const { showError } = useToaster(), dispatch = useDispatch();
	const userDetails = localStorage.getItem("chirp-userDetails");
	const { getPostTiming } = usePostServices(), headerData = getCommonHeader();
	const loggedInUserId = userDetails ? JSON.parse(userDetails)?._id ?? '' : '';

	const [posts, setPosts] = useState([]);
	const [postImages, setPostImages] = useState([]);

	useEffect(() => {
		getPosts();
		// eslint-disable-next-line
	}, []);

	const getPosts = async () => {
		try {
			let _posts = [], images = [];
			const { data: responseData } = await API(Constants.GET, Constants.GET_POSTS);
			if (responseData?.data?.length) _posts = responseData.data;

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
		}
	}

	const getBasePromise = image => {
		return API(Constants.GET, `${Constants.GET_POST_IMAGE}/${image}`, null, headerData);
	}

	const getPromise = (imageName, postIndex, imageIndex, _postImages, parentImageIndex) => {
		return new Promise((res, rej) => {
			getBasePromise(imageName)
				.then(imageResponse => {
					if (imageResponse?.data) {
						const base64ImgData = imageResponse.data;
						const base64Prefix = "data:image/*;charset=utf-8;base64,";
						const imageData = base64Prefix + base64ImgData;

						if (parentImageIndex >= 0) {
							if (!_postImages[postIndex][imageIndex]) _postImages[postIndex][imageIndex] = [];
							_postImages[postIndex][imageIndex][parentImageIndex] = imageData;
						} else {
							_postImages[postIndex][imageIndex] = imageData;
						}

						setPostImages([..._postImages]);
						res();
					} else {
						rej();
					}
				})
				.catch(err => {
					console.log(err);
					rej();
				});
		});
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

	const vote = (postIndex, choiceIndex) => {
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
			API(Constants.POST, Constants.VOTE_POLL, data, headerData).catch(err => {
				console.log(err);
				showError("Something went wrong! Please refresh and try again!");
			});

			choices[choiceIndex].votes++;
			setPosts([..._posts]);
		} else {
			showError("Please login to vote!");
		}
	}

	const getGradient = (votePercent, isVoted = false) => {
		const bgColor = isVoted ? "#1DA1F2" : "#e9ecef";
		return `linear-gradient(to right, ${bgColor} ${votePercent}%, white ${votePercent}% 100%)`;
	}

	const getPollJSX = (pollData, postIndex) => {
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
								onClick={() => { if (!isVoted) vote(postIndex, choiceIndex); }}
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

	const openCommentBox = post => {
		if (isUserLoggedIn()) dispatch(openModalWithProps("commentEditor", post));
		else showError("Please login to comment!");
	}

	const openRepostBox = post => {
		if (isUserLoggedIn()) dispatch(openModalWithProps("repostEditor", post));
		else showError("Please login to repost!");
	}

	const triggerMutedReaction = async (postIndex, action) => {
		if (availableMutedActions.includes(action)) {
			if (isUserLoggedIn()) {
				const _posts = posts, postObj = posts[postIndex];
				const { _id: postId, isLiked, isSaved } = postObj;
				const data = { postId, reaction: '' }; let mode, url;

				switch (action) {
					case "like":
						data["reaction"] = "liked";
						mode = isLiked ? "remove" : "add";
						url = isLiked ? Constants.REMOVE_SAVES_LIKES : Constants.ADD_SAVES_LIKES;
						postObj["isLiked"] = mode === "add";
						postObj["likes"] += mode === "add" ? 1 : -1;
						break;
					case "save":
						data["reaction"] = "saved";
						mode = isSaved ? "remove" : "add";
						url = isSaved ? Constants.REMOVE_SAVES_LIKES : Constants.ADD_SAVES_LIKES;
						postObj["isSaved"] = mode === "add";
						postObj["saved"] += mode === "add" ? 1 : -1;
						break;
					default:
						break;
				}

				if (data["reaction"] && mode && url) {
					API(Constants.POST, url, data, headerData);
					setPosts([..._posts]);
				}
			} else {
				showError("Please login to like!");
			}
		}
	}

	return (
		<div>
			{
				posts.map((post, postIndex) => {
					const { post: parentPost, createdAt, likes, reposts, comments, views, saved, isLiked, isSaved } = post;
					const { name, username, picture } = post.user ?? {};
					let parentPostImages = [], pureImages = [];
					const images = postImages[postIndex];

					const { text: parentPostText, createdAt: parentCreatedAt, user: parentPostUser } = parentPost ?? {};
					const { name: parentName, username: parentUserName, picture: parentPicture } = parentPostUser ?? {};

					if (images?.length) {
						images.forEach(image => {
							if (Array.isArray(image)) parentPostImages = [...image];
							else if (image) pureImages.push(image);
						});
					}

					return name && username ? (
						<Card id="card" key={postIndex}>
							<img src={picture ?? Constants.placeHolderImageSrc} id="user-image" alt="user" />

							<div id="card-body">
								<div className="row mx-0">
									<b>{name}</b>&nbsp;
									<span>{`@${username}`}</span>
									<span><div className="seperator-container"><div className="seperator" /></div></span>
									<span>{getPostTiming(createdAt)}</span>
								</div>

								<div className="row mx-0"><div>{post?.text ?? ''}</div></div>

								{post?.poll?.choices && getPollJSX(post.poll, postIndex)}
								{
									pureImages?.length > 0 && (
										<ImgHolder images={pureImages} showActionButtons={false} />
									)
								}

								{
									parentPost && (
										<div
											className="post-list-repost-body repost-body"
											style={{ marginTop: pureImages.length ? "10px" : '0' }}
										>
											<img
												alt="post creator"
												className="parent-post-user-img"
												src={parentPicture ?? placeHolderImageSrc}
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
										onClick={() => { openCommentBox(post); }}
										className="reaction-icon-container reply-container"
									>
										<span className="reply-icon">
											<CIcon title="Reply" icon={cilCommentBubble} className="chirp-action" />
										</span>

										<span className="post-reaction-data">{comments ?? 0}</span>
									</div>

									<div
										onClick={() => { openRepostBox(post); }}
										className="reaction-icon-container repost-container"
									>
										<span className="reply-icon">
											<CIcon icon={cilSend} title="Repost" className="chirp-action" />
										</span>

										<span className="post-reaction-data">{reposts ?? 0}</span>
									</div>

									<div
										className="reaction-icon-container like-container"
										onClick={() => { triggerMutedReaction(postIndex, "like"); }}
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

									<div className="reaction-icon-container views-container">
										<span className="reply-icon">
											<CIcon title="Views" icon={cilChart} className="chirp-action" />
										</span>

										<span className="post-reaction-data">{views ?? 0}</span>
									</div>

									<div
										className="reaction-icon-container saved-container"
										onClick={() => { triggerMutedReaction(postIndex, "save"); }}
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

export default Posts;
