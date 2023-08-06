import "src/styles/post.css";

import React, { useEffect, useState } from "react";
import { Card } from "@material-ui/core/";
import CIcon from "@coreui/icons-react";
import { cilSend, cilCommentBubble, cilChart, cilThumbUp, cilBookmark } from "@coreui/icons";
import moment from "moment";

import API from "src/api";
import * as Constants from "src/utilities/constants";

const Posts = () => {
	const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";

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

		if (_posts?.[postIndex]?.poll?.choices?.[choiceIndex]?.votes >= 0) {
			_posts[postIndex].poll.choices[choiceIndex].votes += 1;
		}

		setPosts([..._posts]);
	}

	const getGradient = votePercent => {
		return `linear-gradient(to right, #e9ecef ${votePercent}%, white ${votePercent}% 100%)`;
	}

	const getPollJSX = (pollData, postIndex) => {
		const { choices } = pollData;
		const totalVotes = choices.reduce((votesAcc, choiceObj) => {
			return votesAcc += choiceObj.votes;
		}, 0);

		return (
			<div className="mt-3 mb-3">
				{
					choices.map((choiceObj, choiceIndex) => {
						const { label, votes } = choiceObj;
						const votePercent = Math.ceil(votes/totalVotes * 100);

						return (
							<div
								key={choiceIndex}
								className="post-poll-bar"
								onClick={() => { vote(postIndex, choiceIndex); }}
								style={{ background: getGradient(votePercent) }}
							>
								{label ?? ''}
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
