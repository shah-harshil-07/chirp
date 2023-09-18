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
import useToaster from "src/custom-hooks/toaster-message";
import usePostServices from "src/custom-hooks/post-services";
import { openModalWithProps } from "src/redux/actions/modal";

const Posts = () => {
	const { getPostTiming } = usePostServices();
	const { showError } = useToaster(), dispatch = useDispatch();
	const userDetails = localStorage.getItem("chirp-userDetails");
	const loggedInUserId = userDetails ? JSON.parse(userDetails)?._id ?? '' : '';
	const headerData = { Authorization: `Bearer ${localStorage.getItem("chirp-accessToken")}` };

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
				const { images: postImages, post } = postObj;
				if (post?.images?.length) postImages.push(post.images);
				images.push(postImages);
			});

			getPostImages(images);
			setPosts([..._posts]);
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
			const headerData = { Authorization: `Bearer ${localStorage.getItem("chirp-accessToken")}` };
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

	return (
		<div>
			{
				posts.map((post, postIndex) => {
					const { post: parentPost } = post;
					const { name, username } = post.user ?? {};
					const images = postImages[postIndex];
					const parentPostImages = [];
					if (images && Array.isArray(images[images.length - 1])) {
						parentPostImages.push(...images[images.length - 1]);
					}

					if (postIndex == 4) {
						console.log(images);
						console.log(parentPost);
					}

					return name && username ? (
						<Card id="card" key={postIndex}>
							<img src={post?.user?.picture ?? Constants.placeHolderImageSrc} id="user-image" alt="user" />

							<div id="card-body">
								<div className="row mx-0">
									<b>{name}</b>&nbsp;
									<span>{`@${username}`}</span>
									<span><div id="seperator-container"><div id="seperator" /></div></span>
									<span>{getPostTiming(post.createdAt)}</span>
								</div>

								<div className="row mx-0"><div>{post?.text ?? ''}</div></div>

								{post?.poll?.choices && getPollJSX(post.poll, postIndex)}
								{
									images?.length > 0 && (
										<ImgHolder images={images} showActionButtons={false} />
									)
								}

								<div id="action-bar">
									<CIcon
										title="Reply"
										icon={cilCommentBubble}
										className="chirp-action"
										onClick={() => { openCommentBox(post); }}
									/>
									<CIcon
										icon={cilSend}
										title="Repost"
										className="chirp-action"
										onClick={() => { openRepostBox(post); }}
									/>
									<CIcon title="Like" icon={cilThumbUp} className="chirp-action" />
									<CIcon title="Views" icon={cilChart} className="chirp-action" />
									<CIcon title="Bookmark" icon={cilBookmark} className="chirp-action" />
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
