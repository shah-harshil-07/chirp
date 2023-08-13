import "src/styles/post.css";

import moment from "moment";
import CIcon from "@coreui/icons-react";
import { Card } from "@material-ui/core/";
import React, { useEffect, useState } from "react";
import { cilSend, cilCommentBubble, cilChart, cilThumbUp, cilBookmark } from "@coreui/icons";

import API from "src/api";
import * as Constants from "src/utilities/constants";

const Posts = () => {
	const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
	const userDetails = localStorage.getItem("chirp-userDetails");
	const loggedInUserId = userDetails ? JSON.parse(userDetails)?._id ?? '' : '';

	const [posts, setPosts] = useState([]);

	const durationData = [
		{ key: "months", symbol: "mo" },
		{ key: "days", symbol: 'd' },
		{ key: "hours", symbol: 'h' },
		{ key: "minutes", symbol: "min" },
		{ key: "seconds", symbol: 's' },
	];

	useEffect(() => {
		getPosts();
	}, []);

	const getPosts = async () => {
		try {
			let _posts = [];
			const response = await API(Constants.GET, Constants.GET_POSTS);
			if (response?.data?.length) _posts = response.data;
			setPosts([..._posts]);
		} catch (error) {
			console.log(error);
		}
	}

	const getPostTiming = dateObj => {
		const currentDate = Date.now();
		let diff = moment(currentDate).diff(dateObj, "months");

		for (let i = 0; i < durationData.length; i++) {
			const { key, symbol } = durationData[i];
			const diff = moment(currentDate).diff(dateObj, key);
			if (diff > 0) {
				return (symbol === "mo" && diff > 11)
					? moment(currentDate).format("MMM D YYYY")
					: (diff + symbol);
			}
		}

		return diff;
	}

	const vote = (postIndex, choiceIndex) => {
		const _posts = posts;
		const pollObj = _posts[postIndex].poll;
		const { users, choices } = pollObj;

		if (loggedInUserId) {
			const userIndex = users.findIndex(user => user.userId === loggedInUserId);
			if (userIndex >= 0) {
				const originalChoiceIndex = users[userIndex].choiceIndex;
				users[userIndex].choiceIndex = choiceIndex;
				choices[originalChoiceIndex].votes--;
			}
		}

		choices[choiceIndex].votes++;
		setPosts([..._posts]);

		const data = { postId: posts[postIndex]._id, choiceIndex };
		const headerData = { Authorization: `Bearer ${localStorage.getItem("chirp-accessToken")}` };
		API(Constants.POST, Constants.VOTE_POLL, data, headerData);
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
								onClick={() => { vote(postIndex, choiceIndex); }}
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

	return (
		<div>
			{
				posts.map((post, postIndex) => {
					const { name, username } = post.user ?? {};

					return name && username ? (
						<Card id="card" key={postIndex}>
							<img src={post?.user?.picture ?? placeHolderImageSrc} id="user-image" alt="user" />

							<div id="card-body">
								<div className="row mx-0">
									<b>{name}</b>&nbsp;
									<span>{`@${username}`}</span>
									<span><div id="seperator-container"><div id="seperator" /></div></span>
									<span>{getPostTiming(post.createdAt)}</span>
								</div>

								<div className="row mx-0"><div>{post?.text ?? ''}</div></div>

								{post?.poll?.choices && getPollJSX(post.poll, postIndex)}

								<div id="action-bar">
									<CIcon title="Reply" icon={cilCommentBubble} className="chirp-action" />
									<CIcon title="Repost" icon={cilSend} className="chirp-action" />
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
